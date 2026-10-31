/**
 * Замена фона: нейросети MediaPipe (Google, Apache-2.0) находят людей на фото,
 * и мы переносим их на фон другого фото. Всё считается на устройстве — фото никуда не отправляются.
 *
 * Два шага, как в профессиональных редакторах:
 *  1) детектор объектов находит рамку вокруг каждого человека — даже маленького на фоне гор;
 *  2) сегментатор вырезает контур внутри рамки (там человек крупный — контур точный).
 * Модели (~23 МБ: детектор 7 + сегментатор 16) загружаются только при первой замене фона,
 * дальше — из кэша браузера.
 */
import type { ImageSegmenter, ObjectDetector } from '@mediapipe/tasks-vision';

const VERSION = '1.1.1'; // та же версия, что в package.json
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODELS = 'https://storage.googleapis.com/mediapipe-models';
const DETECTOR = `${MODELS}/object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite`;
const SEGMENTERS = {
  /** DeepLab v3: 21 класс объектов, человек — класс 15; хорошо держит фигуру в полный рост. */
  deeplab: { url: `${MODELS}/image_segmenter/deeplab_v3/float32/latest/deeplab_v3.tflite`, person: (m: Float32Array[]) => m[15] },
  /** «Селфи»: фон, волосы, кожа, одежда… — человек = всё, кроме фона; аккуратнее с волосами крупным планом. */
  selfie: {
    url: `${MODELS}/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite`,
    person: (m: Float32Array[]) => m[0].map((v) => 1 - v),
  },
};
export type SegModel = keyof typeof SEGMENTERS;

type Vision = typeof import('@mediapipe/tasks-vision');
let vision: Promise<{ lib: Vision; files: Awaited<ReturnType<Vision['FilesetResolver']['forVisionTasks']>> }> | null = null;
function getVision() {
  if (!vision) {
    vision = (async () => {
      // библиотека подгружается отдельно — основное приложение от этого не тяжелеет
      const lib = await import('@mediapipe/tasks-vision');
      return { lib, files: await lib.FilesetResolver.forVisionTasks(WASM) };
    })();
    vision.catch(() => (vision = null)); // ошибка сети — попробуем снова в следующий раз
  }
  return vision;
}

/** Создать задачу на видеокарте, а если не вышло — на процессоре. */
async function withDelegate<T>(make: (delegate: 'GPU' | 'CPU') => Promise<T>): Promise<T> {
  try {
    return await make('GPU');
  } catch {
    return make('CPU');
  }
}

let detector: Promise<ObjectDetector> | null = null;
function getDetector() {
  if (!detector) {
    detector = getVision().then(({ lib, files }) =>
      withDelegate((delegate) =>
        lib.ObjectDetector.createFromOptions(files, {
          baseOptions: { modelAssetPath: DETECTOR, delegate },
          runningMode: 'IMAGE',
          categoryAllowlist: ['person'],
          scoreThreshold: 0.3,
          maxResults: 6,
        })
      )
    );
    detector.catch(() => (detector = null));
  }
  return detector;
}

const segmenters: Partial<Record<SegModel, Promise<ImageSegmenter>>> = {};
function getSegmenter(model: SegModel) {
  if (!segmenters[model]) {
    segmenters[model] = getVision().then(({ lib, files }) =>
      withDelegate((delegate) =>
        lib.ImageSegmenter.createFromOptions(files, {
          baseOptions: { modelAssetPath: SEGMENTERS[model].url, delegate },
          runningMode: 'IMAGE',
          outputConfidenceMasks: true,
          outputCategoryMask: false,
        })
      )
    );
    segmenters[model]!.catch(() => delete segmenters[model]);
  }
  return segmenters[model]!;
}

const makeCanvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

/** Вероятность «это человек» для каждого пикселя по одной модели. */
async function probability(img: HTMLCanvasElement, model: SegModel) {
  const seg = await getSegmenter(model);
  const res = seg.segment(img);
  const masks = res.confidenceMasks ?? [];
  if (!masks.length) throw new Error('no masks');
  const w = masks[0].width;
  const h = masks[0].height;
  const p = SEGMENTERS[model].person(masks.map((m) => m.getAsFloat32Array()));
  res.close();
  return { p, w, h };
}

/**
 * Плотная маска человека: тело без «дыр», через которые просвечивал бы новый фон.
 *  1) две нейросети: «селфи» (голова, руки, волосы) + DeepLab (фигура целиком, ноги) — берём объединение;
 *  2) порог → чёткая форма;
 *  3) заделываем дыры: всё, что не соединено с краем кадра, — внутри человека, значит это тело;
 *  4) убираем мелкие случайные пятна вдали от человека.
 */
async function solidMask(img: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const a = await probability(img, 'selfie');
  const b = await probability(img, 'deeplab').catch(() => null);
  const { w, h } = a;
  const n = w * h;
  const on = new Uint8Array(n);
  const v = new Float32Array(n); // общая уверенность «это человек»
  const both = !!b && b.w === w && b.h === h;
  // где голова: DeepLab обводит её грубо и захватывает куски старого фона над головой («пятна»),
  // поэтому верхнюю часть фигуры (голова, волосы, шапка) режем только по «селфи»
  let top = h;
  let bottom = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (a.p[y * w + x] > 0.5) {
        top = Math.min(top, y);
        bottom = y;
        break;
      }
  const bodyFrom = top + (bottom - top) * 0.25;
  for (let i = 0; i < n; i++) {
    const s = a.p[i];
    const d = both && i / w >= bodyFrom ? b!.p[i] : 0;
    v[i] = Math.max(s, d);
    // граница — по «селфи» (точнее); DeepLab добавляет тело (ноги, руки) только там, где «селфи» хоть немного согласна
    on[i] = s > 0.45 || (d > 0.6 && s > 0.15) ? 1 : 0;
  }

  // 3) заливка «снаружи» от краёв кадра по фону; всё незалитое — человек (дыры заделаны)
  const outside = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const push = (i: number) => {
    if (!on[i] && !outside[i]) {
      outside[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < n - w) push(i + w);
  }
  // Дыра = область не-человека, не соединённая с краем. Заделываем только настоящие дыры в теле:
  // маленькие или с признаками человека. Просвет между рукой и телом (там явно фон) — оставляем.
  const holeId = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (on[s] || outside[s] || holeId[s]) continue;
    head = tail = 0;
    queue[tail++] = s;
    holeId[s] = 1;
    let sum = 0;
    while (head < tail) {
      const i = queue[head++];
      sum += v[i];
      const x = i % w;
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
      for (const j of nb)
        if (j >= 0 && j < n && !on[j] && !outside[j] && !holeId[j]) {
          holeId[j] = 1;
          queue[tail++] = j;
        }
    }
    const size = tail;
    const fill = size < n * 0.004 || sum / size > 0.15;
    for (let k = 0; k < size; k++) {
      const i = queue[k];
      if (fill) on[i] = 1;
      else outside[i] = 1; // оставляем прозрачным
    }
  }

  // 4) оставляем крупные части (человек и, например, отдельно стоящая рука), мелкий «мусор» убираем
  const label = new Int32Array(n);
  const sizes: number[] = [0];
  for (let s = 0; s < n; s++) {
    if (!on[s] || label[s]) continue;
    const id = sizes.length;
    let size = 0;
    head = tail = 0;
    queue[tail++] = s;
    label[s] = id;
    while (head < tail) {
      const i = queue[head++];
      size++;
      const x = i % w;
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
      for (const j of nb)
        if (j >= 0 && j < n && on[j] && !label[j]) {
          label[j] = id;
          queue[tail++] = j;
        }
    }
    sizes.push(size);
  }
  const biggest = Math.max(0, ...sizes);
  const out = makeCanvas(w, h);
  const og = out.getContext('2d')!;
  const data = og.createImageData(w, h);
  for (let i = 0; i < n; i++) {
    const keep = on[i] && sizes[label[i]] >= biggest * 0.08;
    data.data[i * 4] = data.data[i * 4 + 1] = data.data[i * 4 + 2] = 255;
    data.data[i * 4 + 3] = keep ? 255 : 0;
  }
  og.putImageData(data, 0, 0);
  return out;
}

/** Рамки людей, расширенные с запасом (поднятые руки, волосы, ступни). */
async function personBoxes(photo: HTMLCanvasElement) {
  const det = await getDetector();
  const { detections } = det.detect(photo);
  return detections
    .map((d) => d.boundingBox)
    .filter((b): b is NonNullable<typeof b> => !!b && b.width > 4 && b.height > 4)
    .map((b) => {
      const x = Math.max(0, b.originX - b.width * 0.25);
      const y = Math.max(0, b.originY - b.height * 0.15);
      const x2 = Math.min(photo.width, b.originX + b.width * 1.25);
      const y2 = Math.min(photo.height, b.originY + b.height * 1.1);
      return { x, y, w: x2 - x, h: y2 - y };
    });
}

/**
 * «Сжатие выделения»: полупрозрачный край маски захватывает пиксели старого фона
 * (например, белое небо) — получается светлый ореол. Поджимаем край к телу.
 */
function choke(mask: HTMLCanvasElement) {
  const g = mask.getContext('2d', { willReadFrequently: true })!;
  const img = g.getImageData(0, 0, mask.width, mask.height);
  const d = img.data;
  for (let i = 3; i < d.length; i += 4) {
    const a = d[i] / 255;
    // тело уже плотное (альфа = 1) — кривая меняет только мягкий внешний край
    const k = Math.min(1, Math.max(0, (a - 0.35) / 0.4));
    d[i] = Math.round(k * k * (3 - 2 * k) * 255);
  }
  g.putImageData(img, 0, 0);
}

/** Маска всех людей на фото размером с фото + доля площади, занятая людьми. */
export async function personMask(photo: HTMLCanvasElement) {
  const mask = makeCanvas(photo.width, photo.height);
  const mg = mask.getContext('2d')!;
  mg.imageSmoothingQuality = 'high';
  const feather = Math.max(1, Math.round(Math.min(photo.width, photo.height) * 0.003));
  if ('filter' in mg) mg.filter = `blur(${feather}px)`;

  const boxes = await personBoxes(photo).catch(() => []);
  if (!boxes.length) {
    // детектор никого не нашёл (например, крупный портрет-селфи) — сегментируем всё фото
    mg.drawImage(await solidMask(photo), 0, 0, mask.width, mask.height);
  } else {
    mg.globalCompositeOperation = 'lighten'; // объединяем маски нескольких людей
    for (const b of boxes) {
      const crop = makeCanvas(b.w, b.h);
      crop.getContext('2d')!.drawImage(photo, b.x, b.y, b.w, b.h, 0, 0, crop.width, crop.height);
      mg.drawImage(await solidMask(crop), b.x, b.y, b.w, b.h);
    }
  }
  choke(mask);
  // доля «человека» — чтобы честно сказать, если людей нет
  const probe = makeCanvas(64, 64);
  const pg = probe.getContext('2d', { willReadFrequently: true })!;
  pg.drawImage(mask, 0, 0, 64, 64);
  const px = pg.getImageData(0, 0, 64, 64).data;
  let sum = 0;
  for (let i = 3; i < px.length; i += 4) sum += px[i] / 255;
  return { mask, coverage: sum / (64 * 64), boxes };
}

/* ---------- Части человека: волосы и одежда ---------- */

/** Классы модели «селфи»: 0 фон, 1 волосы, 2 кожа тела, 3 лицо, 4 одежда, 5 прочее (аксессуары). */
const PART_CLASS = { hair: 1, clothes: 4 } as const;
export type BodyPart = keyof typeof PART_CLASS;

/** Маска части тела (волосы / одежда) для куска фото: альфа = уверенность модели. */
async function partMaskOnce(img: HTMLCanvasElement, part: BodyPart) {
  const seg = await getSegmenter('selfie');
  const res = seg.segment(img);
  const masks = res.confidenceMasks ?? [];
  if (masks.length <= PART_CLASS[part]) {
    res.close();
    throw new Error('no masks');
  }
  const m = masks[PART_CLASS[part]];
  const { width: w, height: h } = m;
  const p = m.getAsFloat32Array();
  res.close();
  const out = makeCanvas(w, h);
  const og = out.getContext('2d')!;
  const data = og.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const k = Math.min(1, Math.max(0, (p[i] - 0.3) / 0.4)); // мягкий порог: край без «ступенек»
    data.data[i * 4] = data.data[i * 4 + 1] = data.data[i * 4 + 2] = 255;
    data.data[i * 4 + 3] = Math.round(k * k * (3 - 2 * k) * 255);
  }
  og.putImageData(data, 0, 0);
  return out;
}

/** Маска волос или одежды всех людей на фото (размером с фото) + доля площади. */
export async function bodyPartMask(photo: HTMLCanvasElement, part: BodyPart) {
  const mask = makeCanvas(photo.width, photo.height);
  const mg = mask.getContext('2d')!;
  mg.imageSmoothingQuality = 'high';
  const feather = Math.max(1, Math.round(Math.min(photo.width, photo.height) * 0.002));
  if ('filter' in mg) mg.filter = `blur(${feather}px)`;
  const boxes = await personBoxes(photo).catch(() => []);
  if (!boxes.length) mg.drawImage(await partMaskOnce(photo, part), 0, 0, mask.width, mask.height);
  else {
    mg.globalCompositeOperation = 'lighten';
    for (const b of boxes) {
      const crop = makeCanvas(b.w, b.h);
      crop.getContext('2d')!.drawImage(photo, b.x, b.y, b.w, b.h, 0, 0, crop.width, crop.height);
      mg.drawImage(await partMaskOnce(crop, part), b.x, b.y, b.w, b.h);
    }
  }
  const probe = makeCanvas(64, 64);
  const pg = probe.getContext('2d', { willReadFrequently: true })!;
  pg.drawImage(mask, 0, 0, 64, 64);
  const px = pg.getImageData(0, 0, 64, 64).data;
  let sum = 0;
  for (let i = 3; i < px.length; i += 4) sum += px[i] / 255;
  return { mask, coverage: sum / (64 * 64) };
}

/** Вписать картинку «cover» в прямоугольник. */
function cover(g: CanvasRenderingContext2D, src: HTMLCanvasElement, w: number, h: number) {
  const k = Math.max(w / src.width, h / src.height);
  g.drawImage(src, (w - src.width * k) / 2, (h - src.height * k) / 2, src.width * k, src.height * k);
}

export class NoPersonError extends Error {}

/** Средний цвет фото — «цвет освещения» сцены. */
function averageColor(src: HTMLCanvasElement): string {
  const c = makeCanvas(16, 16);
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(src, 0, 0, 16, 16);
  const d = g.getImageData(0, 0, 16, 16).data;
  let r = 0, gg = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) {
    r += d[i];
    gg += d[i + 1];
    b += d[i + 2];
  }
  const n = d.length / 4;
  return `rgb(${Math.round(r / n)},${Math.round(gg / n)},${Math.round(b / n)})`;
}

/**
 * «Очистка краёв»: в полупрозрачной кромке маски цвет пикселей — смесь человека и старого фона
 * (над головой — кусочки неба, тёмные пятна). Заменяем цвет кромки цветом соседних пикселей тела.
 */
function bleedEdges(person: HTMLCanvasElement, mask: HTMLCanvasElement) {
  const w = person.width;
  const h = person.height;
  // ядро — только уверенные пиксели человека
  const core = makeCanvas(w, h);
  const kg = core.getContext('2d', { willReadFrequently: true })!;
  kg.drawImage(mask, 0, 0);
  const img = kg.getImageData(0, 0, w, h);
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] > 240 ? 255 : 0;
  kg.putImageData(img, 0, 0);
  kg.globalCompositeOperation = 'source-in';
  kg.drawImage(person, 0, 0);

  // размываем ядро наружу: размытие прозрачной картинки даёт средний цвет соседних пикселей тела
  const out = makeCanvas(w, h);
  const og = out.getContext('2d')!;
  const r = Math.max(2, Math.round(Math.min(w, h) * 0.006));
  // под низом — исходное фото: там, где рядом нет уверенного тела (тонкие руки, пальцы), цвет остаётся как был
  og.drawImage(person, 0, 0);
  if ('filter' in og) {
    for (const k of [4, 2, 1]) {
      og.filter = `blur(${r * k}px)`;
      for (let j = 0; j < 3; j++) og.drawImage(core, 0, 0);
    }
    og.filter = 'none';
  }
  og.drawImage(core, 0, 0);
  return out;
}

/**
 * Человек с фото `person` на фоне фото `background`. Размер и композиция — как у первого фото
 * (человек остаётся там же, где стоял).
 */
export async function replaceBackground(person: HTMLCanvasElement, background: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  return composite(person, await cutout(person), background);
}

/** Маска человека для замены фона; если людей нет — NoPersonError. */
export async function cutout(person: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const { mask, coverage } = await personMask(person);
  if (coverage < 0.002) throw new NoPersonError('no person found');
  return mask;
}

/** Человек (по маске) поверх нового фона. `tint` — подстроить цвет человека под освещение фона. */
export function composite(person: HTMLCanvasElement, mask: HTMLCanvasElement, background: HTMLCanvasElement, tint = true): HTMLCanvasElement {
  const w = person.width;
  const h = person.height;

  // 1) вырезаем человека: фото + маска как прозрачность
  const cut = makeCanvas(w, h);
  const cg = cut.getContext('2d')!;
  cg.drawImage(bleedEdges(person, mask), 0, 0);
  // подстройка под освещение нового фона: лёгкий оттенок его среднего цвета (закат → теплее)
  if (tint) {
    cg.globalCompositeOperation = 'soft-light';
    cg.globalAlpha = 0.35;
    cg.fillStyle = averageColor(background);
    cg.fillRect(0, 0, w, h);
    cg.globalAlpha = 1;
  }
  cg.globalCompositeOperation = 'destination-in';
  cg.drawImage(mask, 0, 0);

  // 2) новый фон + человек
  const out = makeCanvas(w, h);
  const g = out.getContext('2d')!;
  cover(g, background, w, h);
  g.drawImage(cut, 0, 0);

  // 3) «light wrap»: по внутреннему краю контура чуть просвечивает цвет нового фона — не выглядит наклеенным
  const edge = makeCanvas(w, h);
  const eg = edge.getContext('2d')!;
  eg.drawImage(mask, 0, 0);
  eg.globalCompositeOperation = 'destination-out';
  if ('filter' in eg) eg.filter = `blur(${Math.max(2, Math.round(Math.min(w, h) * 0.006))}px)`;
  eg.drawImage(mask, 0, 0);
  const wrap = makeCanvas(w, h);
  const wg = wrap.getContext('2d')!;
  cover(wg, background, w, h);
  wg.globalCompositeOperation = 'destination-in';
  wg.drawImage(edge, 0, 0);
  g.globalAlpha = 0.1;
  g.globalCompositeOperation = 'screen';
  g.drawImage(wrap, 0, 0);
  return out;
}

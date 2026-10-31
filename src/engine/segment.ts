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

/** Маска человека на одном изображении (холст: альфа = «насколько это человек»). */
async function segmentOnce(img: HTMLCanvasElement, model: SegModel): Promise<HTMLCanvasElement> {
  const seg = await getSegmenter(model);
  const res = seg.segment(img);
  const masks = res.confidenceMasks ?? [];
  if (!masks.length) throw new Error('no masks');
  const w = masks[0].width;
  const h = masks[0].height;
  const p = SEGMENTERS[model].person(masks.map((m) => m.getAsFloat32Array()));
  res.close();
  const small = makeCanvas(w, h);
  const sg = small.getContext('2d')!;
  const data = sg.createImageData(w, h);
  for (let i = 0; i < p.length; i++) {
    // «поджимаем» неуверенные края: s-образная кривая вокруг 0.5
    const a = p[i] <= 0.3 ? 0 : p[i] >= 0.7 ? 1 : (p[i] - 0.3) / 0.4;
    data.data[i * 4] = data.data[i * 4 + 1] = data.data[i * 4 + 2] = 255;
    data.data[i * 4 + 3] = Math.round(a * a * (3 - 2 * a) * 255);
  }
  sg.putImageData(data, 0, 0);
  return small;
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
    const k = Math.min(1, Math.max(0, (a - 0.45) / 0.4));
    d[i] = Math.round(k * k * (3 - 2 * k) * 255);
  }
  g.putImageData(img, 0, 0);
}

/** Маска всех людей на фото размером с фото + доля площади, занятая людьми. */
export async function personMask(photo: HTMLCanvasElement, model: SegModel = 'selfie') {
  const mask = makeCanvas(photo.width, photo.height);
  const mg = mask.getContext('2d')!;
  mg.imageSmoothingQuality = 'high';
  const feather = Math.max(1, Math.round(Math.min(photo.width, photo.height) * 0.003));
  if ('filter' in mg) mg.filter = `blur(${feather}px)`;

  const boxes = await personBoxes(photo).catch(() => []);
  if (!boxes.length) {
    // детектор никого не нашёл (например, крупный портрет-селфи) — сегментируем всё фото
    mg.drawImage(await segmentOnce(photo, model), 0, 0, mask.width, mask.height);
  } else {
    mg.globalCompositeOperation = 'lighten'; // объединяем маски нескольких людей
    for (const b of boxes) {
      const crop = makeCanvas(b.w, b.h);
      crop.getContext('2d')!.drawImage(photo, b.x, b.y, b.w, b.h, 0, 0, crop.width, crop.height);
      mg.drawImage(await segmentOnce(crop, model), b.x, b.y, b.w, b.h);
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
 * Человек с фото `person` на фоне фото `background`. Размер и композиция — как у первого фото
 * (человек остаётся там же, где стоял).
 */
export async function replaceBackground(person: HTMLCanvasElement, background: HTMLCanvasElement, model: SegModel = 'selfie'): Promise<HTMLCanvasElement> {
  const { mask, coverage } = await personMask(person, model);
  if (coverage < 0.002) throw new NoPersonError('no person found');
  const w = person.width;
  const h = person.height;

  // 1) вырезаем человека: фото + маска как прозрачность
  const cut = makeCanvas(w, h);
  const cg = cut.getContext('2d')!;
  cg.drawImage(person, 0, 0);
  // подстройка под освещение нового фона: лёгкий оттенок его среднего цвета (закат → теплее)
  cg.globalCompositeOperation = 'soft-light';
  cg.globalAlpha = 0.35;
  cg.fillStyle = averageColor(background);
  cg.fillRect(0, 0, w, h);
  cg.globalAlpha = 1;
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
  g.globalAlpha = 0.15;
  g.globalCompositeOperation = 'screen';
  g.drawImage(wrap, 0, 0);
  return out;
}

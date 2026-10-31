/**
 * «Изменить внешность»: перекрасить волосы или одежду, нарисовать на одежде узор.
 * Нейросеть находит волосы и одежду, а цвет меняем по пикселям — пряди, складки ткани и тени остаются,
 * поэтому выглядит как настоящее фото. Всё на устройстве: фото никуда не отправляется.
 *
 * Поменять фасон одежды или форму причёски так нельзя — для этого нужна генеративная нейросеть.
 */
import type { BodyPart } from './segment';

export type Pattern = 'stripes' | 'dots' | 'checks';
export type Tone = 'lighter' | 'darker';

export interface LookRequest {
  part: BodyPart;
  color?: string;
  pattern?: Pattern;
  tone?: Tone;
}

/* ---------- Понимание просьбы ---------- */

const HAIR = /(волос|прическ|причес|шевелюр|блондин|брюнет|hair|blond|brunette|redhead|שיער|תספורת|בלונד)/;
const CLOTHES = /(одежд|футболк|майк|рубаш|плать|куртк|кофт|свитер|пиджак|костюм|пальто|блузк|худи|толстовк|cloth|shirt|dress|jacket|sweater|coat|hoodie|outfit|בגד|חולצ|שמלה|מעיל|ז'קט|סוודר)/;

/** Цвета волос: сначала «волосяные» слова (рыжий, русый…), потом обычные цвета. */
const HAIR_COLORS: [RegExp, string][] = [
  [/(блонд|светл\S* волос|пшенич|blond|בלונד)/, '#e2c48a'],
  [/(рыж|медн|ginger|copper|redhead|ג'ינג'י|ג׳ינג׳י)/, '#b5501f'],
  [/(брюнет|т[её]мн\S* волос|brunette|dark hair)/, '#2a1b13'],
  [/(каштан|chestnut|ערמוני)/, '#5e3420'],
  [/(рус(ый|ые|ым|ой)|light brown)/, '#8b6a46'],
  [/(сед|серебр|silver|grey hair|gray hair|כסוף|שיבה)/, '#c8c8cc'],
  [/(шоколад|chocolate)/, '#4a2c1d'],
  [/(платин|platinum)/, '#ece6d8'],
];

const COLORS: [RegExp, string][] = [
  [/(бел|white|לבן)/, '#f2f2ef'],
  [/(черн|black|שחור)/, '#141416'],
  [/(красн|алы|red|אדום)/, '#c42a32'],
  [/(бордо|вишн|burgundy|בורדו)/, '#6e1426'],
  [/(оранж|orange|כתום)/, '#ee7d26'],
  [/(ж[её]лт|yellow|צהוב)/, '#f0cc2e'],
  [/(зел[её]н|green|ירוק)/, '#2f8f4e'],
  [/(бирюз|turquoise|טורקיז)/, '#1fb3a6'],
  [/(голуб|light blue|תכלת)/, '#6fb8ea'],
  [/(син|blue|כחול)/, '#2350b0'],
  [/(фиолет|сирен|лилов|purple|violet|סגול)/, '#6f3fb0'],
  [/(розов|pink|ורוד)/, '#ef8ab0'],
  [/(сер(ый|ая|ое|ые|ым|ой)|gr[ae]y|אפור)/, '#85878c'],
  [/(бежев|beige|בז')/, '#d9c3a0'],
  [/(коричн|brown|חום)/, '#6b4428'],
  [/(золот|gold|זהב)/, '#d1a33a'],
];

const PATTERNS: [RegExp, Pattern][] = [
  [/(полос|stripe|פסים|מפוספס)/, 'stripes'],
  [/(горош|точк|dots|polka|נקודות|מנוקד)/, 'dots'],
  [/(клетк|клетч|check|plaid|tartan|משבצות)/, 'checks'],
];

/** Есть ли в команде просьба про волосы или одежду (тогда это не обычная правка всего фото). */
export function mentionsLook(t: string): BodyPart | null {
  if (HAIR.test(t)) return 'hair';
  if (CLOTHES.test(t)) return 'clothes';
  return null;
}

/** «покрась волосы на 1 в рыжий» → { part: 'hair', color }. null — не поняли, что именно поменять. */
export function parseLook(t: string): LookRequest | null {
  const part = mentionsLook(t);
  if (!part) return null;
  const pattern = part === 'clothes' ? PATTERNS.find(([re]) => re.test(t))?.[1] : undefined;
  const color = (part === 'hair' ? HAIR_COLORS.find(([re]) => re.test(t))?.[1] : undefined) ?? COLORS.find(([re]) => re.test(t))?.[1];
  const tone: Tone | undefined = /(светлее|ярче|осветл|lighter|brighter|בהיר)/.test(t)
    ? 'lighter'
    : /(темнее|затемн|darker|כהה)/.test(t)
      ? 'darker'
      : undefined;
  if (!color && !pattern && !tone) return null;
  return { part, color, pattern, tone };
}

/* ---------- Перекраска по пикселям ---------- */

const lum = (r: number, g: number, b: number) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255) as [number, number, number];

/** Яркость с сохранением текстуры: сдвигаем среднюю яркость к цели, тени и блики остаются на местах. */
function remapL(l: number, gain: number) {
  return gain >= 1 ? 1 - Math.pow(1 - l, gain) : Math.pow(l, 1 / gain);
}

/** Узор (0..1 — доля «второго» цвета) в точке x, y. */
function patternAt(p: Pattern, x: number, y: number, s: number) {
  if (p === 'stripes') return (x + y) / s % 2 < 1 ? 1 : 0; // диагональные полоски
  if (p === 'checks') {
    const a = Math.floor(x / s) % 2;
    const b = Math.floor(y / s) % 2;
    return (a + b) / 2;
  }
  const cx = ((x % s) + s) % s - s / 2;
  const cy = ((y % s) + s) % s - s / 2;
  return Math.hypot(cx, cy) < s * 0.28 ? 1 : 0;
}

/** Применить просьбу к фото по маске части тела. Возвращает новое фото. */
export function applyLook(photo: HTMLCanvasElement, mask: HTMLCanvasElement, req: LookRequest): HTMLCanvasElement {
  const { width: w, height: h } = photo;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const g = out.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(photo, 0, 0);
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  const mc = document.createElement('canvas');
  mc.width = w;
  mc.height = h;
  const mg = mc.getContext('2d', { willReadFrequently: true })!;
  mg.drawImage(mask, 0, 0, w, h);
  const m = mg.getImageData(0, 0, w, h).data;

  // средняя яркость выбранной части — от неё считаем, насколько осветлить/затемнить
  let sumL = 0;
  let sumA = 0;
  // рамка вокруг одежды/волос — размер узора считаем от неё, а не от всего фото (человек может быть маленьким)
  let x0 = w;
  let y0 = h;
  let x1 = 0;
  let y1 = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = m[i + 3] / 255;
    if (a < 0.5) continue;
    sumL += lum(d[i], d[i + 1], d[i + 2]) * a;
    sumA += a;
    const p = i / 4;
    const x = p % w;
    const y = (p - x) / w;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  if (sumA < 1) return out;
  const meanL = Math.max(0.03, sumL / sumA);

  const main = req.color ? hex(req.color) : null;
  // второй цвет узора — белый на тёмном, тёмный на светлом
  const second = main && lum(main[0] * 255, main[1] * 255, main[2] * 255) < 0.5 ? hex('#f2f2ef') : hex('#1c1c22');
  const cell = Math.max(3, Math.round(Math.min(x1 - x0, y1 - y0) * 0.07));

  for (let y = 0, i = 0; y < h; y++)
    for (let x = 0; x < w; x++, i += 4) {
      const a = m[i + 3] / 255;
      if (a <= 0.01) continue;
      const r = d[i] / 255;
      const gg = d[i + 1] / 255;
      const b = d[i + 2] / 255;
      const l = lum(d[i], d[i + 1], d[i + 2]);
      let nr = r;
      let ng = gg;
      let nb = b;
      if (main || req.pattern) {
        // цель — цвет; на узоре в точке — смесь основного и второго
        let col = main ?? [r, gg, b];
        if (req.pattern) {
          const k = patternAt(req.pattern, x, y, cell);
          col = col.map((c, j) => c + (second[j] - c) * k) as [number, number, number];
        }
        const tl = Math.max(0.03, lum(col[0] * 255, col[1] * 255, col[2] * 255));
        // яркость пикселя «перевозим» к яркости цели, сохраняя рельеф (складки, пряди)
        const nl = remapL(l, Math.min(6, Math.max(0.2, tl / meanL)));
        const k = nl / tl;
        [nr, ng, nb] = col.map((c) => c * k);
        const over = Math.max(nr, ng, nb);
        if (over > 1) {
          // в бликах цвет уходит в белый, а не «пережигается»
          const t = Math.min(1, (over - 1) / over);
          [nr, ng, nb] = [nr, ng, nb].map((c) => Math.min(1, c / over + t));
        }
      }
      if (req.tone) {
        const gain = req.tone === 'lighter' ? 1.8 : 0.55;
        const cl = Math.max(0.01, lum(nr * 255, ng * 255, nb * 255));
        const k = remapL(cl, gain) / cl;
        nr = Math.min(1, nr * k);
        ng = Math.min(1, ng * k);
        nb = Math.min(1, nb * k);
      }
      d[i] = (r + (nr - r) * a) * 255;
      d[i + 1] = (gg + (ng - gg) * a) * 255;
      d[i + 2] = (b + (nb - b) * a) * 255;
    }
  g.putImageData(img, 0, 0);
  return out;
}

/**
 * «Добавить и изменить фото»: команды обычными словами («1 чёрно-белое», «объединить 1 2 3»)
 * → операции над фото. Всё считается прямо на устройстве, по пикселям — работает в любом браузере.
 */
import { mentionsLook, parseLook, type LookRequest } from './partEdit';
import type { BodyPart } from './segment';

export type PhotoOp =
  | 'rotateR'
  | 'rotateL'
  | 'rotate180'
  | 'flip'
  | 'crop'
  | 'zoom'
  | 'bw'
  | 'sepia'
  | 'invert'
  | 'saturate'
  | 'desaturate'
  | 'brighter'
  | 'darker'
  | 'contrast'
  | 'warm'
  | 'cool'
  | 'blur'
  | 'sharpen'
  | 'vignette'
  | 'border'
  | 'round'
  | 'delete'
  | 'duplicate'
  | 'first';

export type MergeMode = 'collage' | 'horizontal' | 'vertical' | 'blend';

export interface PhotoCommand {
  text: string;
  nums: number[]; // номера фото, с 1
  ops: PhotoOp[];
  merge?: MergeMode;
  /** Замена фона: человек с фото person на фоне фото bg. */
  swap?: { person: number; bg: number };
  /** Фон по описанию: «1 фон закат над морем», «размой фон на 2», «фото 3 на белом фоне». */
  bgDesc?: string;
  /** Волосы / одежда: перекрасить, узор, светлее-темнее. null — про волосы/одежду, но не поняли, что сделать. */
  look?: LookRequest | null;
  /** Просьба для ИИ-редактора своими словами («надень на него костюм»), уже без номеров фото. */
  ai?: string;
  amount: number; // «чуть» 0.5 … «сильно» 1.8
}

/* ---------- Номера словами: «второй фотографии» → 2 ---------- */

// в иврите порядковое число часто с артиклем «ה»: «התמונה השנייה»
const ORDINALS: [RegExp, number][] = [
  [/перв|first|ה?ראשונ/, 1],
  [/втор|second|ה?שני/, 2],
  [/трет|third|ה?שליש/, 3],
  [/четв[её]рт|fourth|ה?רביע/, 4],
  [/пят|fifth|ה?חמיש/, 5],
  [/шест|sixth|ה?שיש/, 6],
  [/седьм|seventh|ה?שביע/, 7],
  [/восьм|eighth|ה?שמינ/, 8],
  [/девят|ninth|ה?תשיע/, 9],
  [/десят|tenth|ה?עשיר/, 10],
];
const CARDINALS: [RegExp, number][] = [
  [/один|одна|one|אחת/, 1],
  [/два|две|two|שתיים|שתים/, 2],
  [/три|three|שלוש/, 3],
  [/четыре|four|ארבע/, 4],
  [/пять|five|חמש/, 5],
];
const PHOTO_WORD = '(фото\\S*|фотограф\\S*|снимк\\S*|снимок|картинк\\S*|photo\\S*|picture\\S*|image\\S*|תמונה|תמונות|התמונה)';

/** «вторая фотография», «фото два», «photo two», «התמונה השנייה» → цифры, чтобы дальше работать с номерами. */
function wordsToNumbers(t: string): string {
  let s = t;
  for (const [re, n] of ORDINALS) {
    s = s.replace(new RegExp(`(${re.source})\\S*\\s+${PHOTO_WORD}`, 'g'), ` ${n} `); // «второй фотографии»
    s = s.replace(new RegExp(`${PHOTO_WORD}\\s+(${re.source})\\S*`, 'g'), ` ${n} `); // «התמונה השנייה», «фото второе»
  }
  for (const [re, n] of CARDINALS) s = s.replace(new RegExp(`${PHOTO_WORD}\\s+(номер\\s+|number\\s+|מספר\\s+)?(${re.source})(?=$|[\\s,.;])`, 'g'), ` ${n} `);
  return s.replace(/(фото|photo|תמונה)\s+(номер|number|מספר)\s+(\d+)/g, ' $3 ');
}

/* ---------- Замена фона ---------- */

const SWAP_WORDS = /(фон|background|backdrop|רקע)/;
const SWAP_VERBS = /(вместо|замен|постав|перенес|перемест|на фоне|на фон|instead|replace|swap|put|move|on the background|on background|onto|במקום|החלף|שים|על רקע|לרקע)/;

/**
 * Кто человек, а кто фон:
 *  • «фон 2 вместо фона 1» — номер после «вместо» — фото с человеком;
 *  • «1 на фоне 2» / «1 on background 2» / «1 על רקע 2» — номер после «на фоне» — фон;
 *  • иначе («замени фон 1 на 2», «человек с 1 на 2») — первый номер — человек, второй — фон.
 */
function parseSwap(t: string, nums: number[]): PhotoCommand['swap'] {
  if (nums.length !== 2 || !SWAP_WORDS.test(t) || !SWAP_VERBS.test(t)) return undefined;
  const [a, b] = nums;
  const after = (word: RegExp) => {
    const m = word.exec(t);
    if (!m) return null;
    const n = /\d+/.exec(t.slice(m.index + m[0].length));
    return n ? +n[0] : null;
  };
  const target = after(/(вместо|instead of|instead|במקום)/);
  if (target === a || target === b) return { person: target, bg: target === a ? b : a };
  const bgNum = after(/(на фоне|на фон|on the background of|on background|on the background|onto|על רקע|לרקע)/);
  if (bgNum === a || bgNum === b) return { person: bgNum === a ? b : a, bg: bgNum };
  return { person: a, bg: b };
}

/** Служебные слова команды — всё остальное и есть описание нужного фона. */
const BG_STOP = new RegExp(
  '^(' +
    [
      // русский
      'фон\\S*', 'постав\\S*', 'замен\\S*', 'смен\\S*', 'помен\\S*', 'измен\\S*', 'сдела\\S*', 'верн\\S*', 'перенес\\S*', 'перемест\\S*',
      'добав\\S*', 'хочу', 'давай', 'можно', 'пожалуйста', 'прошу', 'вместо', 'номер', 'человек\\S*', 'люд\\S*', 'сзади', 'позади',
      'на', 'в', 'во', 'с', 'со', 'для', 'у', 'и', 'к', 'по', 'из', 'от', 'за', 'как', 'чтобы', 'чтоб', 'был\\S*', 'будет', 'стал\\S*',
      'это\\S*', 'эт[аиоу]', 'мне', 'мо[йеёю]\\S*', 'нов\\S*', 'друг\\S*', 'вид', 'видом', 'него', 'нее', 'ним', 'ней', 'их', 'там', 'пусть',
      // английский
      'put', 'set', 'make', 'change', 'replace', 'swap', 'use', 'add', 'give', 'the', 'a', 'an', 'with', 'to', 'of', 'on', 'in', 'for',
      'background', 'backdrop', 'bg', 'please', 'into', 'new', 'behind', 'me', 'my', 'it', 'its', 'person', 'people', 'number', 'instead',
      'onto', 'be', 'let', 'and', 'want', 'i',
      // иврит
      'שים', 'תשים', 'שימו', 'החלף', 'תחליף', 'החליפו', 'שנה', 'תשנה', 'שנו', 'עשה', 'תעשה', 'עשו', 'הוסף', 'תוסיף', '\\S*רקע\\S*',
      'של', 'עם', 'את', 'על', 'אל', 'במקום', 'מספר', 'אדם', 'האדם', 'אנשים', 'בבקשה', 'חדש', 'אחר', 'לי', 'שלי', 'שיהיה', 'רוצה', 'אני',
      '[בלהומש]',
    ].join('|') +
    ')$'
);

/** «поставь на фото 1 фон закат над морем» → «закат над морем». */
function bgDescription(t: string): string {
  return t
    .replace(new RegExp(PHOTO_WORD, 'g'), ' ')
    .replace(/[\d.,;:!?«»"“”'()\-–—]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !BG_STOP.test(w))
    .join(' ');
}

/**
 * Просьбы, которые перекраской не сделать: другая одежда, другая причёска, что-то добавить.
 * Их выполняет ИИ-редактор (если пользователь подключил его).
 */
const AI_WORDS =
  /(наден|надет|одень|оден|переод|стриж|постриг|причес|прическ|кудр|кудряв|локон|кос[уаы]|хвост|каре|лыс|бород|усы|очки|шляп|шапк|галстук|добав|дорисуй|нарисуй|сделай его|сделай ее|wear|put on|dress (him|her|them)|haircut|hairstyle|curl|braid|bald|beard|mustache|glasses|hat|tie|add |תלביש|תלבישי|הלבש|תספורת|תסרוקת|מתולתל|צמה|קרח|זקן|משקפיים|כובע|עניבה|תוסיף)/;

/** «1 надень на него костюм» → «надень на него костюм» (номер фото модели не нужен). */
const aiInstruction = (text: string) =>
  text
    .replace(new RegExp(PHOTO_WORD, 'gi'), ' ')
    .replace(/(^|\s)(на|в|on|in|ב|ל)?\s*\d+([\s,.;:]|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/* ---------- Понимание команд (ru / he / en) ---------- */

/** Порядок важен: более конкретные выражения проверяются раньше общих. */
const OP_WORDS: [PhotoOp, RegExp][] = [
  ['rotateL', /(повер|поворот|rotate|turn|סובב|סיבוב).{0,14}(влево|налево|left|שמאל)/],
  ['rotate180', /(переверн|вверх ногами|upside|180|הפוך)/],
  ['rotateR', /(повер|поворот|rotate|turn|סובב|סיבוב)/],
  ['flip', /(зеркал|отраз|mirror|flip|מראה)/],
  ['crop', /(обрез|кадрир|квадрат|crop|square|חתוך|חיתוך|ריבוע)/],
  ['zoom', /(приблиз|увелич|крупн|zoom|enlarge|הגדל|זום|תקרב)/],
  ['bw', /(ч\s?\/\s?б|\bчб\b|черно.?бел|b\s?\/\s?w|black.?and.?white|grayscale|greyscale|שחור.?לבן)/],
  ['sepia', /(сепи|старин|sepia|vintage|ספיה|וינטג)/],
  ['invert', /(негатив|инверт|invert|negative|נגטיב|היפוך צבעים)/],
  ['saturate', /(насыщен|сочн|ярче цвет|ярких цвет|saturat|vivid|colorful|רווי|צבעוני)/],
  ['desaturate', /(бледн|приглуш|блекл|muted|pale|faded|דהוי|חיוור)/],
  ['brighter', /(ярче|светлее|осветл|brighter|lighter|brighten|בהיר)/],
  ['darker', /(темнее|затемн|darker|darken|כהה)/],
  ['contrast', /(контраст|contrast|ניגוד)/],
  ['warm', /(тепле|т[её]пл|warm|(^|\s)חם)/],
  ['cool', /(холодн|прохлад|cool|cold|(^|\s)קר($|\s|ה))/],
  ['blur', /(размы|размыт|blur|טשטש|מטושטש)/],
  ['sharpen', /(резче|ч[её]тче|резкост|sharpen|sharp|(^|\s)חד)/],
  ['vignette', /(виньет|затемни края|vignette|וינייט)/],
  ['border', /(рамк|обвод|border|frame|מסגרת)/],
  ['round', /(скругл|закругл|round|עגל)/],
  ['delete', /(удал|убер|убрать|delete|remove|מחק|הסר)/],
  ['duplicate', /(копи|дублир|duplicate|copy|שכפל|העתק)/],
  ['first', /(на перв\S* мест|в начало|first|to the start|ראשונ|להתחלה)/],
];

const MERGE_WORDS = /(объедин|совмест|соедин|склей|коллаж|сложи|merge|combine|collage|join|מזג|איחוד|אחד|חבר|קולאז)/;
const MODE_WORDS: [MergeMode, RegExp][] = [
  ['blend', /(налож|смеш|прозрач|двойн|экспоз|blend|overlay|double|שכב|ערבב|חשיפה)/],
  ['vertical', /(сверху|вертикал|друг под|столбик|vertical|stack|on top|אנכי|מעל)/],
  ['horizontal', /(рядом|горизонт|в ряд|side|horizontal|row|בשורה|ליד|זה לצד)/],
];
// \b в JS не работает с кириллицей и ивритом — границы слов задаём пробелами
const ALL_WORDS = /(^|[\s,])(все|всем|all|כל|כולן)($|[\s,])/;

/** Разбираем текст на команды: «;», перевод строки или точка разделяют команды. */
export function parseCommands(raw: string, count: number, selected: number[] = []): PhotoCommand[] {
  return raw
    .split(/[;\n]+|\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => {
      const t = wordsToNumbers(text.toLowerCase().replace(/ё/g, 'е'));
      const nums: number[] = [];
      for (const m of t.matchAll(/(\d+)\s*[-–—]\s*(\d+)|\d+/g)) {
        if (m[1] && m[2]) for (let k = +m[1]; k <= +m[2]; k++) nums.push(k);
        else nums.push(+m[0]);
      }
      if (ALL_WORDS.test(t)) for (let k = 1; k <= count; k++) nums.push(k);
      const merge = MERGE_WORDS.test(t) ? (MODE_WORDS.find(([, re]) => re.test(t))?.[0] ?? 'collage') : undefined;
      // операции — в том порядке, в каком они написаны
      const found: { op: PhotoOp; at: number }[] = [];
      const taken: string[] = [];
      for (const [op, re] of OP_WORDS) {
        const m = re.exec(t);
        if (!m) continue;
        // «повернуть влево» не должно ещё раз сработать как «повернуть вправо»
        if (op === 'rotateR' && found.some((f) => f.op === 'rotateL' || f.op === 'rotate180')) continue;
        if (op === 'brighter' && found.some((f) => f.op === 'saturate')) continue;
        if (taken.includes(m[0]) && op !== 'rotateR') continue;
        taken.push(m[0]);
        found.push({ op, at: m.index });
      }
      found.sort((a, b) => a.at - b.at);
      const amount = /(чуть|немного|слегка|a bit|slightly|little|קצת)/.test(t) ? 0.5 : /(сильно|очень|намного|much|very|strong|מאוד|הרבה)/.test(t) ? 1.8 : 1;
      const uniq = [...new Set(nums)];
      const finalNums = uniq.length ? uniq : [...selected];
      const desc = merge || !SWAP_WORDS.test(t) ? '' : bgDescription(t);
      // «фон 2», «на фоне фото 2», «רקע של תמונה 2» — фон берём с другого фото, а не по описанию
      const bgIsPhoto = new RegExp(`(фон\\S*|background|backdrop|רקע)(\\s+(of|של))?(\\s+${PHOTO_WORD})?\\s+\\d`).test(t);
      const swap = merge || (desc && !bgIsPhoto) ? undefined : parseSwap(t, finalNums);
      const bgDesc = !swap && desc ? desc : undefined;
      // «волосы рыжие», «одежда в полоску» — меняем только эту часть, а не всё фото
      const look = merge || swap || bgDesc || !mentionsLook(t) ? undefined : parseLook(t);
      // при замене фона слова вроде «поставь»/«убери» не должны превращаться в другие операции
      const ops = swap || bgDesc || look !== undefined ? [] : found.map((f) => f.op);
      // ИИ: другая одежда/причёска/«добавь…» — или просьба, которую мы иначе не поняли бы
      const plain = !merge && !swap && !bgDesc;
      // если мы сами поняли правку («1 рамка», «1 ярче») — ИИ не нужен (и не тратим деньги пользователя)
      const wantsAi = plain && !ops.length && (look === null || look === undefined || AI_WORDS.test(t));
      const ai = wantsAi ? aiInstruction(text) || undefined : undefined;
      return { text, nums: finalNums, ops, merge, swap, bgDesc, look, ai, amount };
    });
}

/* ---------- Обработка одного фото ---------- */

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

function pixels(src: HTMLCanvasElement, fn: (d: Uint8ClampedArray) => void) {
  const out = canvas(src.width, src.height);
  const g = out.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(src, 0, 0);
  const img = g.getImageData(0, 0, out.width, out.height);
  fn(img.data);
  g.putImageData(img, 0, 0);
  return out;
}

/** Цветовая операция над каждым пикселем: f(r,g,b) → [r,g,b]. */
const perPixel = (src: HTMLCanvasElement, f: (r: number, g: number, b: number) => [number, number, number]) =>
  pixels(src, (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const [r, g, b] = f(d[i], d[i + 1], d[i + 2]);
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
  });

const lum = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;
const mixTo = (r: number, g: number, b: number, k: number, l: number): [number, number, number] => [l + (r - l) * k, l + (g - l) * k, l + (b - l) * k];

function sharpen(src: HTMLCanvasElement, amt: number) {
  const w = src.width;
  const h = src.height;
  const base = src.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data;
  return pixels(src, (d) => {
    const k = 0.6 * amt;
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const v = 5 * base[i + c] - base[i - 4 + c] - base[i + 4 + c] - base[i - w * 4 + c] - base[i + w * 4 + c];
          d[i + c] = base[i + c] + (v - base[i + c]) * k;
        }
      }
  });
}

/** Применить одну операцию; возвращает новое фото (исходное не меняется). */
export function applyOp(src: HTMLCanvasElement, op: PhotoOp, amt = 1): HTMLCanvasElement {
  const { width: w, height: h } = src;
  switch (op) {
    case 'rotateR':
    case 'rotateL': {
      const out = canvas(h, w);
      const g = out.getContext('2d')!;
      g.translate(op === 'rotateR' ? h : 0, op === 'rotateR' ? 0 : w);
      g.rotate(op === 'rotateR' ? Math.PI / 2 : -Math.PI / 2);
      g.drawImage(src, 0, 0);
      return out;
    }
    case 'rotate180': {
      const out = canvas(w, h);
      const g = out.getContext('2d')!;
      g.translate(w, h);
      g.rotate(Math.PI);
      g.drawImage(src, 0, 0);
      return out;
    }
    case 'flip': {
      const out = canvas(w, h);
      const g = out.getContext('2d')!;
      g.translate(w, 0);
      g.scale(-1, 1);
      g.drawImage(src, 0, 0);
      return out;
    }
    case 'crop': {
      const s = Math.min(w, h);
      const out = canvas(s, s);
      out.getContext('2d')!.drawImage(src, (w - s) / 2, (h - s) / 2, s, s, 0, 0, s, s);
      return out;
    }
    case 'zoom': {
      const k = Math.max(0.45, 1 - 0.25 * amt); // показываем центральные 75% (сильнее — меньше)
      const out = canvas(w, h);
      out.getContext('2d')!.drawImage(src, (w * (1 - k)) / 2, (h * (1 - k)) / 2, w * k, h * k, 0, 0, w, h);
      return out;
    }
    case 'bw':
      return perPixel(src, (r, g, b) => mixTo(r, g, b, Math.max(0, 1 - amt), lum(r, g, b)));
    case 'sepia':
      return perPixel(src, (r, g, b) => {
        const k = Math.min(1, amt);
        const s: [number, number, number] = [r * 0.393 + g * 0.769 + b * 0.189, r * 0.349 + g * 0.686 + b * 0.168, r * 0.272 + g * 0.534 + b * 0.131];
        return [r + (s[0] - r) * k, g + (s[1] - g) * k, b + (s[2] - b) * k];
      });
    case 'invert':
      return perPixel(src, (r, g, b) => [255 - r, 255 - g, 255 - b]);
    case 'saturate':
      return perPixel(src, (r, g, b) => mixTo(r, g, b, 1 + 0.5 * amt, lum(r, g, b)));
    case 'desaturate':
      return perPixel(src, (r, g, b) => mixTo(r, g, b, Math.max(0, 1 - 0.45 * amt), lum(r, g, b)));
    case 'brighter':
      return perPixel(src, (r, g, b) => [r * (1 + 0.18 * amt) + 12 * amt, g * (1 + 0.18 * amt) + 12 * amt, b * (1 + 0.18 * amt) + 12 * amt]);
    case 'darker':
      return perPixel(src, (r, g, b) => [r * (1 - 0.2 * amt), g * (1 - 0.2 * amt), b * (1 - 0.2 * amt)]);
    case 'contrast': {
      const k = 1 + 0.35 * amt;
      return perPixel(src, (r, g, b) => [(r - 128) * k + 128, (g - 128) * k + 128, (b - 128) * k + 128]);
    }
    case 'warm':
      return perPixel(src, (r, g, b) => [r + 22 * amt, g + 6 * amt, b - 20 * amt]);
    case 'cool':
      return perPixel(src, (r, g, b) => [r - 20 * amt, g + 2 * amt, b + 24 * amt]);
    case 'blur': {
      // уменьшить и снова увеличить с сглаживанием — мягкое размытие без ctx.filter
      const k = 6 + 8 * amt;
      const small = canvas(w / k, h / k);
      const sg = small.getContext('2d')!;
      sg.imageSmoothingQuality = 'high';
      sg.drawImage(src, 0, 0, small.width, small.height);
      const out = canvas(w, h);
      const g = out.getContext('2d')!;
      g.imageSmoothingQuality = 'high';
      g.drawImage(small, 0, 0, w, h);
      return out;
    }
    case 'sharpen':
      return sharpen(src, amt);
    case 'vignette': {
      const out = canvas(w, h);
      const g = out.getContext('2d')!;
      g.drawImage(src, 0, 0);
      const R = Math.hypot(w, h) / 2;
      const grad = g.createRadialGradient(w / 2, h / 2, R * 0.35, w / 2, h / 2, R);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.95, 0.65 * amt)})`);
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      return out;
    }
    case 'border': {
      const pad = Math.round(Math.min(w, h) * 0.05 * amt);
      const out = canvas(w + pad * 2, h + pad * 2);
      const g = out.getContext('2d')!;
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, out.width, out.height);
      g.drawImage(src, pad, pad);
      return out;
    }
    case 'round': {
      const out = canvas(w, h);
      const g = out.getContext('2d')!;
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, w, h);
      g.beginPath();
      g.roundRect(0, 0, w, h, Math.min(w, h) * 0.08 * amt);
      g.clip();
      g.drawImage(src, 0, 0);
      return out;
    }
    default:
      return src; // delete / duplicate / first — меняют список, а не пиксели
  }
}

/* ---------- Объединение нескольких фото в одно ---------- */

/** Вписать фото в клетку «cover» — без искажений, лишнее обрезается. */
function cover(g: CanvasRenderingContext2D, src: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const k = Math.max(w / src.width, h / src.height);
  const sw = w / k;
  const sh = h / k;
  g.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, x, y, w, h);
}

/** Клетки коллажа (доли квадрата) в зависимости от числа фото и режима. */
function layout(n: number, mode: MergeMode): [number, number, number, number][] {
  if (mode === 'horizontal') return Array.from({ length: n }, (_, i) => [i / n, 0, 1 / n, 1]);
  if (mode === 'vertical') return Array.from({ length: n }, (_, i) => [0, i / n, 1, 1 / n]);
  if (n === 1) return [[0, 0, 1, 1]];
  if (n === 2) return [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]];
  if (n === 3) return [[0, 0, 0.6, 1], [0.6, 0, 0.4, 0.5], [0.6, 0.5, 0.4, 0.5]]; // одно большое + два маленьких
  if (n === 5) return [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 1 / 3, 0.5], [1 / 3, 0.5, 1 / 3, 0.5], [2 / 3, 0.5, 1 / 3, 0.5]];
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return Array.from({ length: n }, (_, i) => [(i % cols) / cols, Math.floor(i / cols) / rows, 1 / cols, 1 / rows]);
}

/* ---------- Выполнение команд ---------- */

export type LogEntry =
  | { kind: 'done'; nums: number[]; ops: PhotoOp[] }
  | { kind: 'swapped'; person: number; bg: number; result: number }
  | { kind: 'bgReplaced'; photo: number; desc: string; look?: 'blur' | 'bw' | 'removed'; result: number; credit?: string }
  | { kind: 'bgNotFound'; desc: string }
  | { kind: 'looked'; nums: number[]; look: LookRequest }
  | { kind: 'noPart'; photo: number; part: BodyPart }
  | { kind: 'lookUnknown'; part: BodyPart }
  | { kind: 'aiDone'; photo: number; text: string }
  | { kind: 'aiNoKey'; text: string }
  | { kind: 'aiError'; reason: 'key' | 'quota' | 'blocked' | 'network' }
  | { kind: 'netError' }
  | { kind: 'noPerson'; person: number }
  | { kind: 'modelError' }
  | { kind: 'merged'; nums: number[]; mode: MergeMode; result: number }
  | { kind: 'deleted'; nums: number[] }
  | { kind: 'noNumber'; text: string }
  | { kind: 'badNumber'; nums: number[]; count: number }
  | { kind: 'notUnderstood'; text: string }
  | { kind: 'needTwo'; text: string };

/**
 * Выполняет команды по очереди. Номера в каждой команде — по текущему списку
 * (после удаления фото номера сдвигаются, как и видит пользователь).
 */
export async function runCommands(start: HTMLCanvasElement[], cmds: PhotoCommand[]): Promise<{ imgs: HTMLCanvasElement[]; log: LogEntry[] }> {
  let imgs = [...start];
  const log: LogEntry[] = [];
  for (const c of cmds) {
    if (c.swap) {
      const { person, bg } = c.swap;
      const bad = [person, bg].filter((n) => n < 1 || n > imgs.length);
      if (bad.length) {
        log.push({ kind: 'badNumber', nums: bad, count: imgs.length });
        continue;
      }
      try {
        // нейросеть подгружается только здесь — при первой замене фона
        const { replaceBackground, NoPersonError } = await import('./segment');
        try {
          imgs.push(await replaceBackground(imgs[person - 1], imgs[bg - 1]));
          log.push({ kind: 'swapped', person, bg, result: imgs.length });
        } catch (e) {
          log.push(e instanceof NoPersonError ? { kind: 'noPerson', person } : { kind: 'modelError' });
        }
      } catch {
        log.push({ kind: 'modelError' });
      }
      continue;
    }
    if (c.bgDesc) {
      const nums = c.nums.length ? c.nums : imgs.length === 1 ? [1] : [];
      if (!nums.length) {
        log.push({ kind: 'noNumber', text: c.text });
        continue;
      }
      const bad = nums.filter((n) => n < 1 || n > imgs.length);
      if (bad.length) {
        log.push({ kind: 'badNumber', nums: bad, count: imgs.length });
        continue;
      }
      let segment: typeof import('./segment');
      try {
        segment = await import('./segment');
      } catch {
        log.push({ kind: 'modelError' });
        continue;
      }
      const { bgSource, makeBackground, BgNotFoundError, BgNetworkError } = await import('./bgRequest');
      const src = bgSource(c.bgDesc);
      const look = src.kind === 'own' ? src.effect : src.kind === 'color' && src.removed ? 'removed' : undefined;
      for (const n of nums) {
        try {
          const photo = imgs[n - 1];
          const mask = await segment.cutout(photo);
          const bg = await makeBackground(src, photo, mask);
          imgs.push(segment.composite(photo, mask, bg.img, bg.tint));
          log.push({ kind: 'bgReplaced', photo: n, desc: c.bgDesc, look, result: imgs.length, credit: bg.credit });
        } catch (e) {
          log.push(
            e instanceof segment.NoPersonError
              ? { kind: 'noPerson', person: n }
              : e instanceof BgNotFoundError
                ? { kind: 'bgNotFound', desc: c.bgDesc }
                : e instanceof BgNetworkError
                  ? { kind: 'netError' }
                  : { kind: 'modelError' }
          );
          if (!(e instanceof segment.NoPersonError)) break; // фон не нашёлся — для остальных фото тоже не найдётся
        }
      }
      continue;
    }
    if (c.ai) {
      const ai = await import('./aiEdit');
      if (!ai.getAiKey()) {
        // ИИ не подключён: простую перекраску сделаем сами, остальное — объясним, как подключить
        if (!c.look) {
          log.push({ kind: 'aiNoKey', text: c.text });
          continue;
        }
      } else {
        const nums = c.nums.length ? c.nums : imgs.length === 1 ? [1] : [];
        if (!nums.length) {
          log.push({ kind: 'noNumber', text: c.text });
          continue;
        }
        const bad = nums.filter((n) => n < 1 || n > imgs.length);
        if (bad.length) {
          log.push({ kind: 'badNumber', nums: bad, count: imgs.length });
          continue;
        }
        for (const n of nums) {
          try {
            imgs[n - 1] = await ai.aiEdit(imgs[n - 1], c.ai);
            log.push({ kind: 'aiDone', photo: n, text: c.ai });
          } catch (e) {
            log.push({
              kind: 'aiError',
              reason:
                e instanceof ai.AiKeyError ? 'key' : e instanceof ai.AiQuotaError ? 'quota' : e instanceof ai.AiBlockedError ? 'blocked' : 'network',
            });
            break;
          }
        }
        continue;
      }
    }
    if (c.look === null) {
      log.push({ kind: 'lookUnknown', part: mentionsLook(c.text.toLowerCase()) ?? 'hair' });
      continue;
    }
    if (c.look) {
      const nums = c.nums.length ? c.nums : imgs.length === 1 ? [1] : [];
      if (!nums.length) {
        log.push({ kind: 'noNumber', text: c.text });
        continue;
      }
      const bad = nums.filter((n) => n < 1 || n > imgs.length);
      if (bad.length) {
        log.push({ kind: 'badNumber', nums: bad, count: imgs.length });
        continue;
      }
      try {
        const [{ bodyPartMask }, { applyLook }] = await Promise.all([import('./segment'), import('./partEdit')]);
        const done: number[] = [];
        for (const n of nums) {
          const { mask, coverage } = await bodyPartMask(imgs[n - 1], c.look.part);
          if (coverage < 0.002) log.push({ kind: 'noPart', photo: n, part: c.look.part });
          else {
            imgs[n - 1] = applyLook(imgs[n - 1], mask, c.look);
            done.push(n);
          }
        }
        if (done.length) log.push({ kind: 'looked', nums: done, look: c.look });
      } catch {
        log.push({ kind: 'modelError' });
      }
      continue;
    }
    if (!c.ops.length && !c.merge) {
      log.push({ kind: 'notUnderstood', text: c.text });
      continue;
    }
    // одно фото — номер можно не писать
    const nums = c.nums.length ? c.nums : imgs.length === 1 ? [1] : [];
    if (!nums.length) {
      log.push({ kind: 'noNumber', text: c.text });
      continue;
    }
    const bad = nums.filter((n) => n < 1 || n > imgs.length);
    if (bad.length) {
      log.push({ kind: 'badNumber', nums: bad, count: imgs.length });
      continue;
    }
    if (c.merge) {
      if (nums.length < 2) {
        log.push({ kind: 'needTwo', text: c.text });
        continue;
      }
      // сначала применяем к фото остальные правки из той же команды («объедини 1 2 и сделай ч/б»)
      let merged = mergePhotos(nums.map((n) => imgs[n - 1]), c.merge);
      for (const op of c.ops) if (!['delete', 'duplicate', 'first'].includes(op)) merged = applyOp(merged, op, c.amount);
      imgs.push(merged);
      log.push({ kind: 'merged', nums, mode: c.merge, result: imgs.length });
      continue;
    }
    if (c.ops.includes('delete')) {
      imgs = imgs.filter((_, i) => !nums.includes(i + 1));
      log.push({ kind: 'deleted', nums });
      continue;
    }
    for (const n of nums) {
      let img = imgs[n - 1];
      for (const op of c.ops) img = applyOp(img, op, c.amount);
      imgs[n - 1] = img;
    }
    if (c.ops.includes('duplicate')) for (const n of nums) imgs.push(imgs[n - 1]);
    if (c.ops.includes('first')) {
      const moved = nums.map((n) => imgs[n - 1]);
      imgs = [...moved, ...imgs.filter((x) => !moved.includes(x))];
    }
    log.push({ kind: 'done', nums, ops: c.ops });
  }
  return { imgs, log };
}

export function mergePhotos(srcs: HTMLCanvasElement[], mode: MergeMode): HTMLCanvasElement {
  const S = 1400;
  const out = canvas(S, S);
  const g = out.getContext('2d')!;
  if (mode === 'blend') {
    // «двойная экспозиция»: каждое следующее фото полупрозрачно поверх
    cover(g, srcs[0], 0, 0, S, S);
    srcs.slice(1).forEach((s, i) => {
      g.globalAlpha = 1 / (i + 2) + 0.15;
      g.globalCompositeOperation = 'screen';
      cover(g, s, 0, 0, S, S);
    });
    return out;
  }
  const gap = 12;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, S, S);
  layout(srcs.length, mode).forEach(([x, y, w, h], i) => {
    const px = x * S + gap / 2;
    const py = y * S + gap / 2;
    g.save();
    g.beginPath();
    g.roundRect(px, py, w * S - gap, h * S - gap, 14);
    g.clip();
    cover(g, srcs[i], px, py, w * S - gap, h * S - gap);
    g.restore();
  });
  return out;
}

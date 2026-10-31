/**
 * Фон «по запросу»: пользователь пишет словами, какой фон хочет («закат над морем», «Эйфелева башня»,
 * «белый», «размытый»), а мы находим подходящую картинку.
 *  • цвет — однотонный «студийный» фон;
 *  • «размытый» / «чёрно-белый» — тот же фон фото, но размытый или бесцветный (человек остаётся резким и цветным);
 *  • всё остальное — настоящая фотография из Wikimedia Commons (свободные лицензии, без ключей и регистрации).
 */

export type BgSource =
  | { kind: 'color'; color: string; removed?: boolean }
  | { kind: 'own'; effect: 'blur' | 'bw' }
  | { kind: 'web'; query: string };

/** Найденная картинка + подпись автора (лицензии CC требуют указывать автора). */
export interface BgResult {
  img: HTMLCanvasElement;
  /** Можно ли «подкрашивать» человека под освещение фона: для однотонного фона — нет. */
  tint: boolean;
  credit?: string;
}

export class BgNotFoundError extends Error {}
export class BgNetworkError extends Error {}

/* ---------- Что просит пользователь ---------- */

const BLUR = /(размы|размо|размаж|боке|blur|bokeh|טשטש|מטושטש)/;
const BW = /(ч\s?\/\s?б|черно.?бел|b\s?\/\s?w|black.?and.?white|grayscale|greyscale|שחור.?לבן)/;
const REMOVE = /(^|\s)(удал|убер|убрать|remove|delete|הסר|מחק|תמחק|תסיר)/;

const COLORS: [RegExp, string][] = [
  [/бел|white|לבן/, '#f4f4f2'],
  [/черн|black|שחור/, '#151517'],
  [/красн|red(\s|$)|אדום/, '#c8323c'],
  [/оранж|orange|כתום/, '#f0883a'],
  [/ж[её]лт|yellow|צהוב/, '#f2cf4a'],
  [/зел[её]н|green|ירוק/, '#3f9a5a'],
  [/голуб|light blue|sky blue|תכלת/, '#7cc4ef'],
  [/син|blue|כחול/, '#2f5fb8'],
  [/фиолет|сирен|purple|violet|סגול/, '#7b4bb7'],
  [/розов|pink|ורוד/, '#f0a3c0'],
  [/сер(ый|ым|ого|ом|ая)|gr[ae]y|אפור/, '#8d9096'],
  [/бежев|beige|בז/, '#e6d6bd'],
  [/золот|gold|זהב/, '#d4a93c'],
];

/** Решаем, откуда взять фон. `desc` — описание фона из команды пользователя. */
export function bgSource(desc: string): BgSource {
  const d = desc.trim();
  if (BW.test(d)) return { kind: 'own', effect: 'bw' };
  if (BLUR.test(d)) return { kind: 'own', effect: 'blur' };
  if (!d || REMOVE.test(d)) return { kind: 'color', color: '#f4f4f2', removed: true }; // «убери фон» → чистый белый
  const words = d.split(/\s+/).filter(Boolean);
  // «красный», «на белом» — цвет; «красный закат» — уже картинка
  const color = COLORS.find(([re]) => re.test(d));
  if (color && words.filter((w) => !/^(цвет\S*|color|colou?r|צבע)$/.test(w)).length === 1) return { kind: 'color', color: color[1] };
  return { kind: 'web', query: d };
}

/* ---------- Сборка картинки фона ---------- */

const makeCanvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

/** Однотонный фон с мягким светом в центре — как студийный фон у фотографа. */
function studio(color: string, w: number, h: number) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  g.fillRect(0, 0, w, h);
  const R = Math.hypot(w, h) / 2;
  const grad = g.createRadialGradient(w / 2, h * 0.42, R * 0.1, w / 2, h / 2, R);
  grad.addColorStop(0, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0.18)');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  return c;
}

/**
 * Тот же фон, но размытый (как на дорогом объективе) или чёрно-белый.
 * Для размытия человека сначала вырезаем по маске — иначе за ним осталась бы размытая тёмная «тень».
 */
function ownEffect(photo: HTMLCanvasElement, effect: 'blur' | 'bw', mask: HTMLCanvasElement) {
  const { width: w, height: h } = photo;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  if (effect === 'bw') {
    g.filter = 'grayscale(1)';
    g.drawImage(photo, 0, 0);
    return c;
  }
  // только фон: место человека — прозрачное (с запасом, чтобы край силуэта не попал в фон)
  const bgOnly = makeCanvas(w, h);
  const bo = bgOnly.getContext('2d')!;
  bo.drawImage(photo, 0, 0);
  bo.globalCompositeOperation = 'destination-out';
  bo.filter = `blur(${Math.max(2, Math.round(Math.min(w, h) * 0.01))}px)`;
  for (let i = 0; i < 3; i++) bo.drawImage(mask, 0, 0);
  // уменьшение усредняет только непрозрачные пиксели — дыра заполняется цветом фона вокруг;
  // от грубого к мелкому: крупные слои закрывают дыру целиком, мелкие возвращают детали
  g.imageSmoothingQuality = 'high';
  for (const k of [96, 48, 24]) {
    const small = makeCanvas(w / k, h / k);
    const sg = small.getContext('2d')!;
    sg.imageSmoothingQuality = 'high';
    sg.drawImage(bgOnly, 0, 0, small.width, small.height);
    g.drawImage(small, 0, 0, w, h);
  }
  const out = makeCanvas(w, h);
  const og = out.getContext('2d')!;
  og.filter = `blur(${Math.max(2, Math.round(Math.min(w, h) * 0.008))}px)`;
  og.drawImage(c, 0, 0);
  return out;
}

/* ---------- Поиск фото в интернете (Wikimedia Commons) ---------- */

const API = 'https://commons.wikimedia.org/w/api.php';
/** Никаких откровенных снимков на открытках. */
const UNSAFE = /(nude|naked|nsfw|porn|sex|erot|топлес|голая|голый|обнаж|эрот|порн|секс|עירום|ערום|סקס|corpse|dead body|труп|blood|кров)/i;
/** Схемы, карты, графики, гербы — это не фон для фото. */
const NOT_PHOTO = /(map|chart|diagram|graph|logo|coat of arms|flag of|scheme|plan of|карта|схема|график|герб|флаг|диаграм|מפה|תרשים|סמל)/i;

/** Самые частые фоны: русский и иврит → английский (на Commons больше всего подписей на английском). */
const DICT: [RegExp, string][] = [
  [/^(закат|сансет|שקיעה|השקיעה)/, 'sunset'],
  [/^(рассвет|восход|זריחה|הזריחה)/, 'sunrise'],
  [/^(мор|ים$|הים$|בים$|לים$)/, 'sea'],
  [/^(океан|אוקיינוס)/, 'ocean'],
  [/^(пляж|берег|חוף|החוף)/, 'beach'],
  [/^(гор[аыуе]?$|гор$|горн|הר$|הרים|ההרים)/, 'mountains'],
  [/^(лес|יער|היער)/, 'forest'],
  [/^(пол[еяю]$|поля|שדה|השדה)/, 'field'],
  [/^(цвет(ы|ов|ами|ах)$|פרחים|הפרחים)/, 'flowers'],
  [/^(неб[оау]|שמיים|השמיים|שמים)/, 'sky'],
  [/^(облак|עננים)/, 'clouds'],
  [/^(космос|галакт|חלל|החלל|גלקסי)/, 'galaxy'],
  [/^(зв[её]зд|כוכבים)/, 'starry sky'],
  [/^(город|עיר|העיר)/, 'city'],
  [/^(ночн|ночь|לילה|הלילה)/, 'night'],
  [/^(водопад|מפל)/, 'waterfall'],
  [/^(озер|אגם)/, 'lake'],
  [/^(рек[аиуе]|נהר)/, 'river'],
  [/^(снег|снеж|שלג)/, 'snow'],
  [/^(зим|חורף)/, 'winter'],
  [/^(осен|סתיו)/, 'autumn'],
  [/^(весн|весен|אביב)/, 'spring'],
  [/^(лет(о|ом|ний|няя|нее)$|קיץ)/, 'summer'],
  [/^(пустын|מדבר)/, 'desert'],
  [/^(сад|גן$|הגן$)/, 'garden'],
  [/^(парк|פארק)/, 'park'],
  [/^(пальм|דקל)/, 'palm trees'],
  [/^(остров|אי$|האי$)/, 'island'],
  [/^(радуг|קשת)/, 'rainbow'],
  [/^(северн\S* сияни|сияни|זוהר)/, 'aurora'],
  [/^(замок|замк|טירה)/, 'castle'],
  [/^(мост|גשר)/, 'bridge'],
  [/^(тропик|טרופי)/, 'tropical'],
  [/^(париж|פריז)/, 'Paris'],
  [/^(эйфел|אייפל)/, 'Eiffel Tower'],
  [/^(лондон|לונדון)/, 'London'],
  [/^(нью.?йорк|ניו.?יורק)/, 'New York'],
  [/^(москв|מוסקבה)/, 'Moscow'],
  [/^(иерусалим|ירושלים)/, 'Jerusalem'],
  [/^(тель.?авив|תל.?אביב)/, 'Tel Aviv'],
  [/^(рим$|рима$|רומא)/, 'Rome'],
  [/^(венеци|ונציה)/, 'Venice'],
  [/^(петербург|питер)/, 'Saint Petersburg'],
];

/** «закат над морем» → «sunset sea» (только если поняли все важные слова — иначе ищем как написано). */
function translate(q: string): string | null {
  const words = q.split(/\s+/).filter((w) => !/^(над|под|у|в|на|с|и|of|over|the|על|ליד|עם)$/.test(w));
  const out = words.map((w) => DICT.find(([re]) => re.test(w))?.[1]);
  return out.every(Boolean) ? [...new Set(out)].join(' ') : null;
}

interface Found {
  url: string;
  w: number;
  h: number;
  credit: string;
}

const stripHtml = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function commonsSearch(search: string, signal: AbortSignal): Promise<Found[]> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: `${search} filetype:bitmap -nude -naked`,
    gsrnamespace: '6',
    gsrlimit: '24',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiextmetadatafilter: 'Artist|LicenseShortName',
    iiurlwidth: '1600',
  });
  const res = await fetch(`${API}?${params}`, { signal });
  if (!res.ok) throw new BgNetworkError(String(res.status));
  const data = await res.json();
  type Page = { index: number; title: string; imageinfo?: { thumburl?: string; width: number; height: number; mime: string; extmetadata?: Record<string, { value: string }> }[] };
  return (Object.values(data.query?.pages ?? {}) as Page[])
    .sort((a, b) => a.index - b.index)
    .flatMap((p) => {
      const i = p.imageinfo?.[0];
      if (!i?.thumburl || i.mime !== 'image/jpeg' || i.width < 1000 || i.height < 650) return [];
      if (UNSAFE.test(p.title) || NOT_PHOTO.test(p.title)) return [];
      const artist = stripHtml(i.extmetadata?.Artist?.value).slice(0, 60);
      const license = stripHtml(i.extmetadata?.LicenseShortName?.value);
      const name = p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '');
      return [{ url: i.thumburl, w: i.width, h: i.height, credit: [name, artist, license, 'Wikimedia Commons'].filter(Boolean).join(' · ') }];
    });
}

function loadImage(url: string, signal: AbortSignal): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Commons разрешает — иначе холст нельзя было бы сохранить
    const abort = () => {
      img.src = '';
      reject(new BgNetworkError('aborted'));
    };
    signal.addEventListener('abort', abort, { once: true });
    img.onload = () => {
      signal.removeEventListener('abort', abort);
      const c = makeCanvas(img.naturalWidth, img.naturalHeight);
      c.getContext('2d')!.drawImage(img, 0, 0);
      resolve(c);
    };
    img.onerror = () => reject(new BgNetworkError('image'));
    img.src = url;
  });
}

/** Сколько раз уже искали то же самое — повторная команда даёт следующую картинку. */
const seen = new Map<string, number>();

async function webBackground(query: string, aspect: number): Promise<BgResult> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const en = translate(query);
    // сначала — «Качественные изображения» Commons (отобранные фото), потом — всё подряд
    // если поняли все слова — сначала по-английски: так фото больше и они точнее подписаны
    const attempts = [en && `${en} incategory:Quality_images`, `${query} incategory:Quality_images`, en, query].filter(
      (s, i, a): s is string => !!s && a.indexOf(s) === i
    );
    let found: Found[] = [];
    for (const a of attempts) {
      try {
        found = await commonsSearch(a, ctl.signal);
      } catch {
        throw new BgNetworkError('search'); // нет интернета, таймаут или сервис занят
      }
      if (found.length) break;
    }
    if (!found.length) throw new BgNotFoundError(query);
    // похожая форма кадра (горизонтальный к горизонтальному) — меньше обрезается
    const fit = (f: Found) => Math.abs(Math.log(f.w / f.h / aspect));
    const good = found.filter((f) => fit(f) < 0.45);
    const list = good.length >= 3 ? good : found;
    const n = seen.get(query) ?? 0;
    seen.set(query, n + 1);
    const pick = list[n % list.length];
    return { img: await loadImage(pick.url, ctl.signal), tint: true, credit: pick.credit };
  } finally {
    clearTimeout(timer);
  }
}

/** Картинка фона по описанию для фото `photo`; `mask` — где на фото человек. */
export async function makeBackground(src: BgSource, photo: HTMLCanvasElement, mask: HTMLCanvasElement): Promise<BgResult> {
  if (src.kind === 'color') return { img: studio(src.color, photo.width, photo.height), tint: false };
  if (src.kind === 'own') return { img: ownEffect(photo, src.effect, mask), tint: false };
  return webBackground(src.query, photo.width / photo.height);
}

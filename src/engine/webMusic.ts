import { getAudioContext } from './audio';

/**
 * Поиск музыки в интернете без регистрации и ключей.
 * Только свободная музыка (общественное достояние и Creative Commons без запрета изменений) —
 * её законно накладывать на открытку-видео. Источники:
 *  • Wikimedia Commons — проверенные лицензии, быстрый API, mp3-версии для iPhone;
 *  • Openverse — общий поиск по Jamendo и др. (бывает недоступен — тогда просто пропускаем).
 * Аудио скачивается целиком: так его можно и слушать, и смешать с видео (нужен CORS).
 */
export interface WebSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  license: string;
  licenseUrl: string;
  source: 'wikimedia' | 'openverse' | 'archive' | 'link';
  image?: string;
  /** Песня на языке запроса (русский/иврит) — показываем первой. */
  native?: boolean;
}

export type Script = 'cyr' | 'heb';
const SCRIPT_RE: Record<Script, RegExp> = { cyr: /[а-яё]/i, heb: /[֐-׿]/ };
const ARCHIVE_LANG: Record<Script, string> = { cyr: 'language:(rus OR russian OR ru)', heb: 'language:(heb OR hebrew OR he)' };

export const scriptOf = (s: string): Script | null => (SCRIPT_RE.cyr.test(s) ? 'cyr' : SCRIPT_RE.heb.test(s) ? 'heb' : null);

/** Специальный запрос подсказки «На русском / בעברית»: просто свободные песни на этом языке. */
export const NATIVE_QUERY = '__native__';

const stripHtml = (s: string) => {
  const d = document.createElement('div');
  d.innerHTML = s;
  return (d.textContent ?? '').replace(/\s+/g, ' ').trim();
};

const isNoDerivs = (license: string) => /(^|[\s-])nd(\b|-)/i.test(license);

/** Отсеиваем то, что музыкой не является: произношение слов, начитанные статьи и т. п. */
const NOT_MUSIC = /^(LL-Q|[a-z]{2,3}(-[a-z]{2})?-)|spoken wikipedia|wikipedia recording|pronunciation|произношение|audiobook|librivox|interview|speech|lecture|podcast|field recording|интервью|речь|лекция/i;
/** Для открыток не подходят гимны, военная и политическая тематика. */
const UNSUITABLE = /anthem|national|state song|\binno\b|hymne|гимн|המנון|military|army|navy\b|marines|soldier|division\b|regiment|war\b|battle|fascis|nazi|propaganda|partisan|revolution|военн|войн|армия|партизан|революц|солдат|parade|парад|מלחמה|צבא/i;
/** Нецензурное — в приложении для поздравлений недопустимо (проверяем название и исполнителя). */
const PROFANE = /f+u+c+k|\bshit|bitch|\bcunt|\bdick\b|\bporn|\bsex\b|\bnigg|\bwhore|хуй|хуе|хуё|пизд|бляд|\bбля\b|ёб|еба[нл]|\bсука\b|мудак|залуп|זונה|\bכוס\b|זין\b|שרמוט/i;
export const isProfane = (s: string) => PROFANE.test(s);

/** Записи вики-проектов (поздравления Википедии, новости, встречи) — это речь, а не музыка. */
const WIKI_EVENT = /wikipedia|wikinews|wikimania|wikimedia|\bwiki\b|\bspeaker\b/i;

async function searchCommons(q: string, signal: AbortSignal): Promise<WebSong[]> {
  const p = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: `${q} filetype:audio`,
    gsrlimit: '40',
    prop: 'videoinfo',
    viprop: 'url|size|mime|derivatives|extmetadata',
    viextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist',
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${p}`, { signal });
  const json = await res.json();
  const pages = Object.values(json.query?.pages ?? {}) as {
    pageid: number;
    index: number;
    title: string;
    videoinfo?: {
      duration?: number;
      url: string;
      derivatives?: { src: string; type: string }[];
      extmetadata?: Record<string, { value: string }>;
    }[];
  }[];
  return pages
    .sort((a, b) => a.index - b.index)
    .flatMap((pg) => {
      const v = pg.videoinfo?.[0];
      if (!v) return [];
      const name = pg.title.replace(/^File:/, '').replace(/\.[^.]+$/, '');
      const license = v.extmetadata?.LicenseShortName?.value ?? '';
      const dur = v.duration ?? 0;
      const artistRaw = v.extmetadata?.Artist?.value ?? '';
      if (NOT_MUSIC.test(name) || UNSUITABLE.test(name) || WIKI_EVENT.test(name) || /speaker:/i.test(artistRaw)) return [];
      if (dur < 40 || dur > 900 || !license || isNoDerivs(license)) return [];
      // mp3 играет везде, включая iPhone; Ogg — не везде
      const mp3 = v.derivatives?.find((d) => d.type.startsWith('audio/mpeg'))?.src;
      return [
        {
          id: `wm:${pg.pageid}`,
          title: name.replace(/_/g, ' '),
          artist: stripHtml(v.extmetadata?.Artist?.value ?? '') || 'Wikimedia Commons',
          duration: dur,
          url: mp3 ?? v.url,
          license,
          licenseUrl: v.extmetadata?.LicenseUrl?.value || `https://commons.wikimedia.org/?curid=${pg.pageid}`,
          source: 'wikimedia' as const,
        },
      ];
    });
}

interface OpenverseItem {
  id: string;
  title: string;
  creator?: string;
  duration?: number;
  url: string;
  license: string;
  license_version?: string;
  license_url?: string;
  thumbnail?: string;
  source: string;
}

async function searchOpenverse(q: string, signal: AbortSignal): Promise<WebSong[]> {
  const p = new URLSearchParams({ q, category: 'music', license_type: 'modification', source: 'jamendo,wikimedia_audio', page_size: '20' });
  const res = await fetch(`https://api.openverse.org/v1/audio/?${p}`, { signal });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const json = await res.json();
  return (json.results as OpenverseItem[])
    .filter((r) => r.url && !isNoDerivs(r.license) && !UNSUITABLE.test(r.title))
    .map((r) => ({
      id: `ov:${r.id}`,
      title: r.title,
      artist: r.creator ?? '',
      duration: (r.duration ?? 0) / 1000,
      // у Jamendo файлы с CORS отдаёт storage.jamendo.com (prod-1.storage… — без CORS)
      url: r.url.replace('://prod-1.storage.jamendo.com', '://storage.jamendo.com'),
      license: `CC ${r.license.toUpperCase()} ${r.license_version ?? ''}`.trim(),
      licenseUrl: r.license_url ?? '',
      source: 'openverse' as const,
      image: r.thumbnail,
    }));
}

/* ---------- Internet Archive: только коллекция netlabels ---------- */

/**
 * Netlabels — релизы независимых лейблов, которые сами выпускают музыку под CC.
 * Общую коллекцию (opensource_audio) не берём: туда заливают и чужие хиты с ложной лицензией.
 * По той же причине не принимаем «public domain mark» — им чаще всего злоупотребляют.
 */
const lucene = (s: string) => s.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, ' ').trim();

const parseLength = (v: string | undefined) => {
  if (!v) return 0;
  if (v.includes(':')) return v.split(':').reduce((acc, x) => acc * 60 + parseFloat(x), 0);
  return parseFloat(v) || 0;
};

interface IaDoc {
  identifier: string;
  title: string;
  creator?: string | string[];
  licenseurl: string;
}
interface IaFile {
  name: string;
  format?: string;
  title?: string;
  creator?: string;
  artist?: string;
  length?: string;
}

/**
 * lang — искать только релизы на этом языке; без terms — просто популярные релизы на нём.
 * raw — q уже собран на языке запросов Archive (для категорий: subject:… OR title:…).
 */
async function searchArchive(q: string, signal: AbortSignal, lang?: Script, raw = false): Promise<WebSong[]> {
  const terms = raw ? q : lucene(q);
  if (!terms && !lang) return [];
  const parts = ['collection:netlabels', 'mediatype:audio'];
  if (lang) parts.push(ARCHIVE_LANG[lang]);
  if (terms) parts.push(`(${terms})`);
  // без «/» в шаблонах: в поисковом языке Archive слэш начинает регулярное выражение
  const query = `${parts.join(' AND ')} AND licenseurl:*creativecommons.org* AND NOT licenseurl:*publicdomain* AND NOT licenseurl:*nd*`;
  const p = new URLSearchParams({ q: query, rows: '8', output: 'json' });
  for (const f of ['identifier', 'title', 'creator', 'licenseurl']) p.append('fl[]', f);
  p.append('sort[]', 'downloads desc');
  const res = await fetch(`https://archive.org/advancedsearch.php?${p}`, { signal });
  const docs = ((await res.json()).response?.docs ?? []) as IaDoc[];
  const words = terms.toLowerCase().split(/\s+/);

  // У каждого альбома берём до 3 треков; сначала те, где слова запроса есть в названии
  const perItem = await Promise.all(
    docs.map(async (d) => {
      try {
        const meta = await (await fetch(`https://archive.org/metadata/${encodeURIComponent(d.identifier)}`, { signal })).json();
        const album = Array.isArray(d.creator) ? d.creator[0] : d.creator;
        return ((meta.files ?? []) as IaFile[])
          .filter((f) => /\.mp3$/i.test(f.name) && !/_64kb|_vbr\.m3u|sample/i.test(f.name))
          .map((f) => {
            const title = f.title || f.name.split('/').pop()!.replace(/\.mp3$/i, '').replace(/[_]+/g, ' ');
            return {
              id: `ia:${d.identifier}/${f.name}`,
              title,
              artist: f.artist || f.creator || album || d.title,
              duration: parseLength(f.length),
              url: `https://archive.org/download/${encodeURIComponent(d.identifier)}/${f.name.split('/').map(encodeURIComponent).join('/')}`,
              license: licenseShort(d.licenseurl),
              licenseUrl: d.licenseurl,
              source: 'archive' as const,
              native: lang ? true : undefined,
            };
          })
          .filter((s) => s.duration >= 40 && s.duration <= 900 && !UNSUITABLE.test(s.title))
          .sort((a, b) => +words.some((w) => b.title.toLowerCase().includes(w)) - +words.some((w) => a.title.toLowerCase().includes(w)))
          .slice(0, 3);
      } catch {
        return [];
      }
    })
  );
  // без слов запроса тексты треков не сортируем по совпадению — берём как есть
  return perItem.flat();
}

const licenseShort = (url: string) => {
  const m = /licenses\/([a-z-]+)\/([\d.]+)?/.exec(url);
  return m ? `CC ${m[1].toUpperCase()}${m[2] ? ' ' + m[2] : ''}` : 'CC';
};

/* ---------- Перевод запроса ---------- */

/** В свободных каталогах почти всё подписано по-английски — дополняем запрос переводом. */
const DICT: [RegExp, string][] = [
  [/д(е|ё)нь рожд|днюх|др\b|יום הולדת|יומולדת/i, 'birthday'],
  [/любо?в|люблю|любим|влюбл|אהבה|אוהב/i, 'love'],
  [/романт|רומנט/i, 'romantic'],
  [/свадьб|חתונה/i, 'wedding'],
  [/праздн|торжеств|חג|חגיג/i, 'celebration'],
  [/новый год|новогод|שנה טובה|ראש השנה/i, 'new year'],
  [/рожд(е|ё)ств|christmas|כריסמס/i, 'christmas'],
  [/вечерин|туса|מסיבה/i, 'party'],
  [/весел|весёл|радост|счаст|שמח|אושר/i, 'happy'],
  [/груст|печал|עצוב/i, 'sad'],
  [/спокой|тих|релакс|רגוע|שקט/i, 'calm'],
  [/пианин|фортепиан|פסנתר/i, 'piano'],
  [/гитар|גיטרה/i, 'guitar'],
  [/джаз|ג׳אז|ג'אז/i, 'jazz'],
  [/рок\b|רוק/i, 'rock'],
  [/танц|ריקוד|לרקוד/i, 'dance'],
  [/детск|дети|ילדים/i, 'children'],
  [/колыбел|שיר ערש/i, 'lullaby'],
  [/вальс|ואלס/i, 'waltz'],
  [/мам|אמא/i, 'mother'],
  [/спасиб|благодар|תודה/i, 'thank you'],
  [/утр|בוקר/i, 'morning'],
  [/лет[оа]|קיץ/i, 'summer'],
  [/зим|חורף/i, 'winter'],
  [/смешн|юмор|прикол|מצחיק/i, 'funny'],
];

export function translateQuery(q: string): string | null {
  const en = [...new Set(DICT.filter(([re]) => re.test(q)).map(([, w]) => w))];
  if (!en.length) return null;
  const t = en.join(' ');
  return t.toLowerCase() === q.trim().toLowerCase() ? null : t;
}

/* ---------- Объединение и ранжирование ---------- */

function rank(songs: WebSong[], queries: string[], script: Script | null): WebSong[] {
  const words = queries.join(' ').toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  const score = (s: WebSong) => {
    const title = s.title.toLowerCase();
    let v = 0;
    // смысл запроса важнее языка: «день рождения» → сначала песни про день рождения,
    // а среди них — на русском; песни на русском без совпадения — следом
    if (words.some((w) => title.includes(w))) v += 6;
    if (s.native) v += 4;
    if (s.duration >= 90 && s.duration <= 360) v += 1.5; // длительность «как у песни»
    if (s.source === 'archive' || s.source === 'openverse') v += 1; // музыкальные каталоги
    if (/\d{4} recording|cylinder|78rpm/i.test(title)) v -= 1; // старые граммофонные записи — ниже
    return v;
  };
  if (script) for (const s of songs) s.native ||= SCRIPT_RE[script].test(s.title + ' ' + s.artist);
  return songs
    .map((s, i) => ({ s, v: score(s) - i * 0.001 })) // при равенстве — исходный порядок
    .sort((a, b) => b.v - a.v)
    .map((x) => x.s);
}

type OnResults = (songs: WebSong[], done: boolean) => void;
type Job = (signal: AbortSignal, openverseSignal: AbortSignal) => Promise<WebSong[]>[];

/**
 * Запускает поиск во всех источниках параллельно; результаты показываются по мере прихода.
 * finalize решает, что показать и в каком порядке. Openverse ждём не дольше 4 секунд.
 */
function collect(makeJobs: Job, finalize: (all: WebSong[]) => WebSong[], onResults: OnResults): () => void {
  const ctrl = new AbortController();
  const ovCtrl = new AbortController();
  const timer = setTimeout(() => ovCtrl.abort(), 4000);
  ctrl.signal.addEventListener('abort', () => ovCtrl.abort());
  const jobs = makeJobs(ctrl.signal, ovCtrl.signal);
  const all: WebSong[] = [];
  const seen = new Set<string>();
  const titles = new Set<string>();
  let pending = jobs.length;
  const settle = (songs: WebSong[]) => {
    if (ctrl.signal.aborted) return;
    for (const s of songs) {
      const key = s.title.toLowerCase();
      if (seen.has(s.id) || titles.has(key)) continue; // один трек — один раз, даже из разных альбомов
      if (isProfane(`${s.title} ${s.artist}`)) continue;
      seen.add(s.id);
      titles.add(key);
      all.push(s);
    }
    pending--;
    onResults(finalize(all).slice(0, 40), pending === 0);
  };
  for (const j of jobs) j.then(settle, () => settle([]));
  return () => {
    clearTimeout(timer);
    ctrl.abort();
  };
}

/* ---------- Поиск по названию ---------- */

/** Сравниваем без регистра, «ё/е», пунктуации и номеров треков. */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Насколько название совпадает с запросом. -1 — не совпадает (такую запись не показываем).
 * 100 — точно та песня (в т. ч. «Исполнитель — Название»), 80 — запрос целиком внутри названия,
 * 60 — все слова есть в названии, 40 — слова нашлись в названии и имени исполнителя вместе.
 */
export function titleScore(s: WebSong, query: string): number {
  const Q = norm(query);
  if (!Q) return -1;
  const t = norm(s.title.replace(/^\s*\d{1,3}\s*[-.)]\s*/, ''));
  const words = Q.split(' ');
  if (t === Q || t.endsWith(' ' + Q) || t.startsWith(Q + ' ')) return 100;
  if (t.includes(Q)) return 80;
  if (words.every((w) => t.includes(w))) return 60;
  const ta = `${t} ${norm(s.artist)}`;
  if (words.every((w) => ta.includes(w))) return 40;
  return -1;
}

/**
 * Ищем ровно ту песню, название которой ввели: без перевода и без «похожих».
 * В выдаче только записи, где есть все слова запроса; сначала — точные совпадения.
 */
export function searchByTitle(query: string, onResults: OnResults): () => void {
  const q = query.trim();
  const words = norm(q).split(' ').filter(Boolean);
  return collect(
    (signal, ovSignal) => [
      searchArchive(q, signal),
      // intitle: — слово должно быть именно в названии файла
      searchCommons(words.map((w) => `intitle:${w}`).join(' '), signal),
      searchOpenverse(q, ovSignal),
    ],
    (all) =>
      all
        .map((s, i) => ({ s, v: titleScore(s, q) - i * 0.001 }))
        .filter((x) => x.v > 0)
        .sort((a, b) => b.v - a.v)
        .map((x) => x.s),
    onResults
  );
}

/* ---------- Поиск по категории ---------- */

/**
 * Категория = набор английских тегов (в свободных каталогах всё подписано по-английски).
 * Для русского/иврита дополнительно ищем релизы на этом языке в той же категории и ставим их выше.
 * tags пустой — «На русском / בעברית»: просто свободные песни на языке интерфейса.
 */
export function searchByCategory(tags: string, uiScript: Script | null, onResults: OnResults): () => void {
  const subject = tags
    .split(' ')
    .map((w) => `subject:(${w}) OR title:(${w})`)
    .join(' OR ');
  return collect(
    (signal, ovSignal) => {
      const jobs: Promise<WebSong[]>[] = [];
      if (uiScript) jobs.push(searchArchive(tags ? `(${subject})` : '', signal, uiScript, true));
      if (tags) jobs.push(searchArchive(`(${subject})`, signal, undefined, true), searchCommons(`${tags} music`, signal), searchOpenverse(tags, ovSignal));
      return jobs;
    },
    (all) => rank(all, [tags], uiScript),
    onResults
  );
}

const buffers = new Map<string, Promise<AudioBuffer>>();

/** Для открытки хватает первых минут песни: 4 МБ ≈ 1,5–4 минуты mp3 — грузится в разы быстрее. */
const PART = 4 * 1024 * 1024;

async function fetchAudio(url: string, partial: boolean): Promise<ArrayBuffer> {
  const r = await fetch(url, partial ? { headers: { Range: `bytes=0-${PART - 1}` } } : undefined);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.arrayBuffer();
}

/** Скачать и раскодировать. Ошибка CORS = сайт не разрешает использовать файл в других приложениях. */
export function loadWebAudio(url: string, partial = false): Promise<AudioBuffer> {
  let p = buffers.get(url);
  if (!p) {
    const ac = getAudioContext();
    p = partial
      ? // обрезанный mp3 декодируется до последнего целого кадра; если формат не позволил — качаем целиком
        fetchAudio(url, true)
          .then((d) => ac.decodeAudioData(d))
          .catch(() => fetchAudio(url, false).then((d) => ac.decodeAudioData(d)))
      : fetchAudio(url, false).then((d) => ac.decodeAudioData(d));
    p.catch(() => buffers.delete(url));
    buffers.set(url, p);
  }
  return p;
}

/** Ссылка на Google Drive / Dropbox «для просмотра» → прямая ссылка на файл. */
export function directLink(raw: string): string {
  const url = raw.trim();
  const gd = /drive\.google\.com\/file\/d\/([^/]+)/.exec(url);
  if (gd) return `https://drive.google.com/uc?export=download&id=${gd[1]}`;
  if (/dropbox\.com/.test(url)) return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/[?&]dl=0/, '');
  return url;
}

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
}

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

async function searchArchive(q: string, signal: AbortSignal): Promise<WebSong[]> {
  const terms = lucene(q);
  if (!terms) return [];
  // без «/» в шаблонах: в поисковом языке Archive слэш начинает регулярное выражение
  const query = `collection:netlabels AND mediatype:audio AND (${terms}) AND licenseurl:*creativecommons.org* AND NOT licenseurl:*publicdomain* AND NOT licenseurl:*nd*`;
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
  [/песн|песен|שיר/i, 'song'],
  [/смешн|юмор|прикол|מצחיק/i, 'funny'],
];

export function translateQuery(q: string): string | null {
  const en = [...new Set(DICT.filter(([re]) => re.test(q)).map(([, w]) => w))];
  if (!en.length) return null;
  const t = en.join(' ');
  return t.toLowerCase() === q.trim().toLowerCase() ? null : t;
}

/* ---------- Объединение и ранжирование ---------- */

function rank(songs: WebSong[], queries: string[]): WebSong[] {
  const words = queries.join(' ').toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  const score = (s: WebSong) => {
    const title = s.title.toLowerCase();
    let v = 0;
    if (words.some((w) => title.includes(w))) v += 3; // слово запроса в названии
    if (s.duration >= 90 && s.duration <= 360) v += 1.5; // длительность «как у песни»
    if (s.source === 'archive' || s.source === 'openverse') v += 1; // музыкальные каталоги
    if (/\d{4} recording|cylinder|78rpm/i.test(title)) v -= 1; // старые граммофонные записи — ниже
    return v;
  };
  return songs
    .map((s, i) => ({ s, v: score(s) - i * 0.001 })) // при равенстве — исходный порядок
    .sort((a, b) => b.v - a.v)
    .map((x) => x.s);
}

/**
 * Ищем во всех источниках параллельно по исходному запросу и его английскому переводу.
 * Результаты показываются по мере прихода; Openverse ждём не дольше 4 секунд.
 */
export function searchWebMusic(q: string, onResults: (songs: WebSong[], done: boolean) => void): () => void {
  const ctrl = new AbortController();
  const ovCtrl = new AbortController();
  const timer = setTimeout(() => ovCtrl.abort(), 4000);
  ctrl.signal.addEventListener('abort', () => ovCtrl.abort());
  const tr = translateQuery(q);
  const queries = tr ? [q, tr] : [q];

  let all: WebSong[] = [];
  const jobs: Promise<WebSong[]>[] = [];
  for (const query of queries) {
    jobs.push(searchArchive(query, ctrl.signal), searchCommons(query, ctrl.signal));
  }
  jobs.push(searchOpenverse(tr ?? q, ovCtrl.signal));

  let pending = jobs.length;
  const settle = (songs: WebSong[]) => {
    if (ctrl.signal.aborted) return;
    const seen = new Set(all.map((s) => s.id));
    const titles = new Set(all.map((s) => s.title.toLowerCase()));
    for (const s of songs) {
      const key = s.title.toLowerCase();
      if (seen.has(s.id) || titles.has(key)) continue; // один трек — один раз, даже из разных альбомов
      seen.add(s.id);
      titles.add(key);
      all.push(s);
    }
    pending--;
    onResults(rank(all, queries).slice(0, 40), pending === 0);
  };
  for (const j of jobs) j.then(settle, () => settle([]));
  return () => {
    clearTimeout(timer);
    ctrl.abort();
  };
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

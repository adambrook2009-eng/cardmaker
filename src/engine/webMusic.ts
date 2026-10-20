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
  source: 'wikimedia' | 'openverse' | 'link';
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
const UNSUITABLE = /anthem|national|\binno\b|hymne|гимн|המנון|military|army|navy\b|marines|soldier|war\b|battle|fascis|nazi|propaganda|partisan|revolution|военн|войн|армия|партизан|революц|солдат|parade|парад|מלחמה|צבא/i;

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
      if (NOT_MUSIC.test(name) || UNSUITABLE.test(name) || dur < 40 || dur > 900 || !license || isNoDerivs(license)) return [];
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

/**
 * Ищем в обоих источниках параллельно. Commons приходит быстро и показывается сразу,
 * Openverse дополняет список, если успел ответить за 5 секунд.
 */
export function searchWebMusic(q: string, onResults: (songs: WebSong[], done: boolean) => void): () => void {
  const ctrl = new AbortController();
  const ovCtrl = new AbortController();
  const timer = setTimeout(() => ovCtrl.abort(), 5000);
  ctrl.signal.addEventListener('abort', () => ovCtrl.abort());
  let all: WebSong[] = [];
  let pending = 2;
  const add = (songs: WebSong[]) => {
    const seen = new Set(all.map((s) => s.title.toLowerCase()));
    all = [...all, ...songs.filter((s) => !seen.has(s.title.toLowerCase()))];
  };
  const finish = () => {
    if (ctrl.signal.aborted) return;
    pending--;
    onResults(all.slice(0, 30), pending === 0);
  };
  searchCommons(q, ctrl.signal).then(add).catch(() => {}).finally(finish);
  searchOpenverse(q, ovCtrl.signal).then(add).catch(() => {}).finally(() => {
    clearTimeout(timer);
    finish();
  });
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

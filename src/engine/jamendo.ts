import type { CategoryId, Lang } from '../types';
import { getAudioContext } from './audio';

/**
 * Настоящие песни с вокалом из Jamendo — легальная библиотека музыки под лицензиями Creative Commons.
 * Ищем по языку текста песни (= язык интерфейса) и по настроению повода.
 * Ключ (client_id) публичный: https://devportal.jamendo.com → переменная VITE_JAMENDO_CLIENT_ID.
 */
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string | undefined;
export const songsEnabled = () => !!CLIENT_ID;

export interface Song {
  id: string;
  name: string;
  artist: string;
  duration: number;
  image: string;
  license: string;
}

const MOOD_TAGS: Record<CategoryId, string[]> = {
  congrats: ['birthday', 'party', 'happy', 'celebration'],
  wishes: ['happy', 'positive', 'uplifting', 'optimistic'],
  sympathy: ['calm', 'peaceful', 'emotional', 'sad'],
  funny: ['funny', 'fun', 'humor', 'crazy'],
  kind: ['happy', 'acoustic', 'sweet', 'children'],
  love: ['love', 'romantic'],
};

interface ApiTrack {
  id: string;
  name: string;
  artist_name: string;
  duration: number;
  album_image?: string;
  image?: string;
  license_ccurl: string;
}

async function query(lang: string, tags?: string[]): Promise<Song[]> {
  const p = new URLSearchParams({
    client_id: CLIENT_ID!,
    format: 'json',
    limit: '30',
    vocalinstrumental: 'vocal',
    lang,
    audioformat: 'mp31',
    order: 'popularity_total',
  });
  if (tags) p.set('fuzzytags', tags.join(' '));
  const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?${p}`);
  const json = await res.json();
  if (json.headers?.status !== 'success') throw new Error(json.headers?.error_message ?? 'Jamendo error');
  return (json.results as ApiTrack[])
    // «без производных» (ND) нельзя накладывать на видео — такие песни не показываем
    .filter((t) => !/\/(by-)?(nc-)?nd\//.test(t.license_ccurl) && !/-nd\b/.test(t.license_ccurl))
    .map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artist_name,
      duration: t.duration,
      image: t.album_image || t.image || '',
      license: t.license_ccurl,
    }));
}

export interface SongList {
  songs: Song[];
  /** true — песен на этом языке не нашлось, показываем английские. */
  fallback: boolean;
}

const lists = new Map<string, Promise<SongList>>();

export function findSongs(lang: Lang, category: CategoryId): Promise<SongList> {
  const key = `${lang}|${category}`;
  let p = lists.get(key);
  if (!p) {
    p = (async () => {
      let songs = await query(lang, MOOD_TAGS[category]);
      // по настроению мало — добавляем просто популярные песни на этом языке
      if (songs.length < 6) {
        const more = await query(lang);
        songs = [...songs, ...more.filter((m) => !songs.some((s) => s.id === m.id))];
      }
      let fallback = false;
      if (!songs.length && lang !== 'en') {
        songs = await query('en', MOOD_TAGS[category]);
        fallback = true;
      }
      return { songs: songs.slice(0, 12), fallback };
    })();
    p.catch(() => lists.delete(key)); // ошибка сети — попробуем снова в следующий раз
    lists.set(key, p);
  }
  return p;
}

const buffers = new Map<string, Promise<AudioBuffer>>();

/** Скачиваем песню целиком: так её можно и слушать, и записать в видео-открытку. */
export function loadSong(id: string): Promise<AudioBuffer> {
  let p = buffers.get(id);
  if (!p) {
    // storage.jamendo.com отдаёт файлы с CORS (prod-1.storage… — нет), иначе браузер не даст их смешать
    p = fetch(`https://storage.jamendo.com/?trackid=${encodeURIComponent(id)}&format=mp31`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((data) => getAudioContext().decodeAudioData(data));
    p.catch(() => buffers.delete(id));
    buffers.set(id, p);
  }
  return p;
}

/** Обычно припев — примерно через треть песни; короткие треки играем с начала. */
export const defaultOffset = (duration: number) => (duration > 60 ? Math.round(Math.min(45, duration * 0.3)) : 0);

export function licenseLabel(url: string) {
  const m = /licenses\/([a-z-]+)\//.exec(url);
  return m ? `CC ${m[1].toUpperCase()}` : 'CC';
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

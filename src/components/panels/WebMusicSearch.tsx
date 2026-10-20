import { useEffect, useRef, useState } from 'react';
import type { CategoryId, Lang, MusicChoice } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { getAudioContext } from '../../engine/audio';
import { defaultOffset, fmtTime } from '../../engine/jamendo';
import { directLink, loadWebAudio, searchWebMusic, type WebSong } from '../../engine/webMusic';

/**
 * Готовые запросы под повод — на языке интерфейса, чтобы не печатать.
 * Ищем по английскому слову (q): в свободных каталогах почти всё подписано по-английски.
 */
type Quick = { q: string } & Record<Lang, string>;
const QUICK: Record<CategoryId, Quick[]> = {
  congrats: [
    { q: 'happy birthday', ru: 'День рождения', he: 'יום הולדת', en: 'Birthday' },
    { q: 'celebration', ru: 'Праздник', he: 'חגיגה', en: 'Celebration' },
    { q: 'party dance', ru: 'Вечеринка', he: 'מסיבה', en: 'Party' },
    { q: 'happy pop', ru: 'Весёлый поп', he: 'פופ שמח', en: 'Happy pop' },
  ],
  wishes: [
    { q: 'happy', ru: 'Радостная', he: 'שמחה', en: 'Happy' },
    { q: 'morning', ru: 'Утро', he: 'בוקר', en: 'Morning' },
    { q: 'uplifting', ru: 'Вдохновляющая', he: 'מעוררת השראה', en: 'Uplifting' },
    { q: 'jazz', ru: 'Джаз', he: 'ג׳אז', en: 'Jazz' },
  ],
  sympathy: [
    { q: 'calm piano', ru: 'Спокойное пианино', he: 'פסנתר רגוע', en: 'Calm piano' },
    { q: 'ambient', ru: 'Тихая', he: 'שקטה', en: 'Ambient' },
    { q: 'sad', ru: 'Грустная', he: 'עצובה', en: 'Sad' },
    { q: 'acoustic', ru: 'Акустика', he: 'אקוסטי', en: 'Acoustic' },
  ],
  funny: [
    { q: 'funny', ru: 'Смешная', he: 'מצחיקה', en: 'Funny' },
    { q: 'polka', ru: 'Полька', he: 'פולקה', en: 'Polka' },
    { q: 'chiptune', ru: '8-бит', he: '8 ביט', en: '8-bit' },
    { q: 'ragtime', ru: 'Регтайм', he: 'רגטיים', en: 'Ragtime' },
  ],
  kind: [
    { q: 'lullaby', ru: 'Колыбельная', he: 'שיר ערש', en: 'Lullaby' },
    { q: 'children', ru: 'Детская', he: 'לילדים', en: 'Kids' },
    { q: 'acoustic guitar', ru: 'Гитара', he: 'גיטרה', en: 'Guitar' },
    { q: 'summer', ru: 'Лето', he: 'קיץ', en: 'Summer' },
  ],
  love: [
    { q: 'love song', ru: 'Песня о любви', he: 'שיר אהבה', en: 'Love song' },
    { q: 'romantic', ru: 'Романтика', he: 'רומנטי', en: 'Romantic' },
    { q: 'wedding', ru: 'Свадьба', he: 'חתונה', en: 'Wedding' },
    { q: 'waltz', ru: 'Вальс', he: 'ואלס', en: 'Waltz' },
  ],
};

interface Props {
  category: CategoryId;
  activeId: string | undefined;
  onChoose: (m: MusicChoice) => void;
}

export function WebMusicSearch({ category, activeId, onChoose }: Props) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const [songs, setSongs] = useState<WebSong[] | null>(null);
  const [done, setDone] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const cancel = useRef<() => void>(() => {});

  /** label — что показать в поле (подсказка на языке интерфейса), query — что искать. */
  const run = (query: string, label?: string) => {
    const s = query.trim();
    if (!s) return;
    cancel.current();
    setQ(label ?? s);
    setSongs(null);
    setError('');
    setDone(false);
    cancel.current = searchWebMusic(s, (res, fin) => {
      setSongs(res);
      setDone(fin);
    });
  };

  useEffect(() => () => cancel.current(), []);

  const pick = async (s: WebSong) => {
    getAudioContext(); // «будим» звук прямо в обработчике нажатия
    setLoadingId(s.id);
    setError('');
    try {
      const buffer = await loadWebAudio(s.url, true);
      onChoose({ kind: 'file', name: s.title, buffer, offset: defaultOffset(buffer.duration), songId: s.id, credit: s.artist ? `${s.title} — ${s.artist}` : s.title, license: s.licenseUrl });
    } catch {
      setError(t.ui.webLoadError);
    } finally {
      setLoadingId(null);
    }
  };

  const addLink = async () => {
    const url = directLink(link);
    if (!/^https?:\/\//.test(url)) return;
    getAudioContext();
    setLoadingId('link');
    setError('');
    try {
      const buffer = await loadWebAudio(url);
      const name = decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? 'song').replace(/\.[^.]+$/, '') || 'song';
      onChoose({ kind: 'file', name, buffer, offset: defaultOffset(buffer.duration), songId: `link:${url}` });
      setLink('');
    } catch {
      setError(t.ui.webLinkError);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="web-music">
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
      >
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.ui.webPlaceholder} dir="auto" enterKeyHint="search" />
        <button type="submit" className="primary-sm" aria-label={t.ui.webSearch}>
          🔍
        </button>
      </form>
      <div className="chips">
        {QUICK[category].map((w) => (
          <button key={w.q} className={`chip ${q === w.q || q === w[lang] ? 'active' : ''}`} onClick={() => run(w.q, w[lang])}>
            {w[lang]}
          </button>
        ))}
      </div>

      {error && <p className="hint error">{error}</p>}
      {!done && <p className="hint">{t.ui.webLoading}</p>}
      {done && songs && songs.length === 0 && <p className="hint">{t.ui.webNothing}</p>}

      {songs && songs.length > 0 && (
        <div className="song-list">
          {songs.map((s) => {
            const active = activeId === s.id;
            return (
              <button key={s.id} className={`song ${active ? 'active' : ''}`} onClick={() => pick(s)} disabled={loadingId !== null}>
                {s.image ? <img src={s.image} alt="" loading="lazy" /> : <span className="song-cover">{s.source === 'wikimedia' ? '📻' : s.source === 'archive' ? '💿' : '🎵'}</span>}
                <span className="song-meta">
                  <span className="song-name">{s.title}</span>
                  <span className="song-artist">
                    {s.artist} · {s.license}
                  </span>
                </span>
                <span className="song-dur">{loadingId === s.id ? '⏳' : active ? '🔊' : fmtTime(s.duration)}</span>
              </button>
            );
          })}
        </div>
      )}

      <details className="link-box">
        <summary>🔗 {t.ui.webLinkTitle}</summary>
        <form
          className="search-row"
          onSubmit={(e) => {
            e.preventDefault();
            addLink();
          }}
        >
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/song.mp3" dir="ltr" />
          <button type="submit" className="primary-sm" disabled={loadingId !== null}>
            {loadingId === 'link' ? '⏳' : '➕'}
          </button>
        </form>
        <p className="hint">{t.ui.webLinkHint}</p>
      </details>

      <p className="hint">{t.ui.webNote}</p>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { CategoryId, MusicChoice } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { getAudioContext } from '../../engine/audio';
import { defaultOffset, fmtTime } from '../../engine/jamendo';
import { directLink, loadWebAudio, searchWebMusic, type WebSong } from '../../engine/webMusic';

/** Готовые запросы под повод — чтобы не печатать. Английские слова дают больше результатов. */
const QUICK: Record<CategoryId, string[]> = {
  congrats: ['happy birthday', 'celebration', 'party', 'fanfare'],
  wishes: ['happy', 'morning', 'jazz', 'waltz'],
  sympathy: ['calm', 'piano', 'requiem', 'peaceful'],
  funny: ['funny', 'polka', 'ragtime', 'circus'],
  kind: ['lullaby', 'children', 'nature', 'guitar'],
  love: ['love song', 'romance', 'serenade', 'waltz'],
};

interface Props {
  category: CategoryId;
  activeId: string | undefined;
  onChoose: (m: MusicChoice) => void;
}

export function WebMusicSearch({ category, activeId, onChoose }: Props) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [songs, setSongs] = useState<WebSong[] | null>(null);
  const [done, setDone] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const cancel = useRef<() => void>(() => {});

  const run = (query: string) => {
    const s = query.trim();
    if (!s) return;
    cancel.current();
    setQ(s);
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
          <button key={w} className="chip" onClick={() => run(w)}>
            {w}
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
                {s.image ? <img src={s.image} alt="" loading="lazy" /> : <span className="song-cover">{s.source === 'wikimedia' ? '📻' : '🎵'}</span>}
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

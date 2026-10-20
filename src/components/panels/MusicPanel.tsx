import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CardApi } from '../../state/useCard';
import type { MusicChoice } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { TRACKS } from '../../data/music';
import { decodeAudioFile, getAudioContext, musicPlayer } from '../../engine/audio';
import { defaultOffset, findSongs, fmtTime, licenseLabel, loadSong, songsEnabled, type Song, type SongList } from '../../engine/jamendo';
import { WebMusicSearch } from './WebMusicSearch';

export const useMusicPlaying = () => useSyncExternalStore(musicPlayer.subscribe, musicPlayer.isPlaying);

export function MusicPanel({ api }: { api: CardApi }) {
  const { t, lang } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState(false);
  const [list, setList] = useState<SongList | null>(null);
  const [listError, setListError] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const playing = useMusicPlaying();
  const music = api.card.music;
  const category = api.card.category;

  // Песни подбираются заново при смене языка интерфейса
  useEffect(() => {
    if (!songsEnabled()) return;
    let alive = true;
    setList(null);
    setListError(false);
    findSongs(lang, category)
      .then((l) => alive && setList(l))
      .catch(() => alive && setListError(true));
    return () => {
      alive = false;
    };
  }, [lang, category]);

  // Выбор = сразу послушать (нажатие пользователя разрешает браузеру включить звук)
  const choose = (m: MusicChoice) => {
    api.patch({ music: m });
    musicPlayer.play(m);
  };

  const pickSong = async (s: Song) => {
    getAudioContext(); // «будим» звук прямо в обработчике нажатия
    setLoadingId(s.id);
    try {
      const buffer = await loadSong(s.id);
      choose({ kind: 'file', name: s.name, buffer, offset: defaultOffset(buffer.duration), songId: s.id, credit: `${s.name} — ${s.artist}`, license: s.license });
    } catch {
      setListError(true);
    } finally {
      setLoadingId(null);
    }
  };

  const isActive = (m: MusicChoice) =>
    m.kind === music.kind && (m.kind !== 'builtin' || (music.kind === 'builtin' && music.id === m.id));

  return (
    <div className="panel">
      {music.kind !== 'none' && (
        <button className="big-action" onClick={() => (playing ? musicPlayer.stop() : musicPlayer.play(music))}>
          {playing ? `⏸ ${t.ui.musicStop}` : `▶ ${t.ui.musicPlay}`}
        </button>
      )}

      {music.kind === 'file' && (
        <div className="song-trim">
          <div className="song-now">
            🎵 <b>{music.credit ?? music.name}</b>
            {music.license && (
              <a href={music.license} target="_blank" rel="noreferrer" className="license">
                {/creativecommons\.org\/licenses/.test(music.license) ? licenseLabel(music.license) : 'ⓘ'}
              </a>
            )}
          </div>
          <label>
            {t.ui.songStart}: {fmtTime(music.offset ?? 0)}
            <input
              type="range"
              min={0}
              max={Math.max(0, Math.floor(music.buffer.duration - 10))}
              value={music.offset ?? 0}
              onChange={(e) => api.patch({ music: { ...music, offset: +e.target.value } })}
              // слушаем новый фрагмент, когда палец/мышь отпущены
              onPointerUp={() => musicPlayer.play(api.card.music)}
              onKeyUp={() => musicPlayer.play(api.card.music)}
            />
          </label>
        </div>
      )}

      {/* Любая настоящая песня с телефона/компьютера — без регистрации и на любом языке */}
      <h3>🎤 {t.ui.musicOwn}</h3>
      <button className="big-action secondary" onClick={() => input.current?.click()}>
        📁 {t.ui.musicOwnPick}
      </button>
      {fileError && <p className="hint error">{t.ui.musicError}</p>}

      <h3>🌐 {t.ui.webTitle}</h3>
      <WebMusicSearch category={category} activeId={music.kind === 'file' ? music.songId : undefined} onChoose={choose} />

      {songsEnabled() && (
        <>
          <h3>🎤 {t.ui.songsTitle}</h3>
          {list?.fallback && <p className="hint">{t.ui.songsFallback}</p>}
          {listError && <p className="hint error">{t.ui.songsError}</p>}
          {!list && !listError && <p className="hint">{t.ui.songLoading}</p>}
          <div className="song-list">
            {list?.songs.map((s) => {
              const active = music.kind === 'file' && music.songId === s.id;
              return (
                <button key={s.id} className={`song ${active ? 'active' : ''}`} onClick={() => pickSong(s)} disabled={loadingId !== null}>
                  {s.image ? <img src={s.image} alt="" loading="lazy" /> : <span className="song-cover">🎵</span>}
                  <span className="song-meta">
                    <span className="song-name">{s.name}</span>
                    <span className="song-artist">{s.artist}</span>
                  </span>
                  <span className="song-dur">{loadingId === s.id ? '⏳' : active && playing ? '🔊' : fmtTime(s.duration)}</span>
                </button>
              );
            })}
          </div>
          <p className="hint">
            {t.ui.songsCredit}{' '}
            <a href="https://www.jamendo.com" target="_blank" rel="noreferrer">
              Jamendo
            </a>
          </p>
        </>
      )}

      <h3>🎹 {t.ui.melodiesTitle}</h3>
      <div className="tile-grid">
        <button className={`tile ${music.kind === 'none' ? 'active' : ''}`} onClick={() => choose({ kind: 'none' })}>
          <span className="tile-icon">🔇</span>
          <span>{t.ui.musicNone}</span>
        </button>
        {TRACKS.map((tr) => {
          const m: MusicChoice = { kind: 'builtin', id: tr.id };
          return (
            <button key={tr.id} className={`tile ${isActive(m) ? 'active' : ''}`} onClick={() => choose(m)}>
              <span className="tile-icon">{tr.icon}</span>
              <span>{t.tracks[tr.id]}</span>
            </button>
          );
        })}
      </div>

      <input
        ref={input}
        type="file"
        accept="audio/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          try {
            setFileError(false);
            const buffer = await decodeAudioFile(f);
            choose({ kind: 'file', name: f.name.replace(/\.[^.]+$/, ''), buffer, offset: defaultOffset(buffer.duration) });
          } catch {
            setFileError(true);
          }
        }}
      />
      <p className="hint">{t.ui.musicHint}</p>
    </div>
  );
}

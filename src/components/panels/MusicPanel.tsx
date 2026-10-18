import { useRef, useState, useSyncExternalStore } from 'react';
import type { CardApi } from '../../state/useCard';
import type { MusicChoice } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { TRACKS } from '../../data/music';
import { decodeAudioFile, musicPlayer } from '../../engine/audio';

export const useMusicPlaying = () => useSyncExternalStore(musicPlayer.subscribe, musicPlayer.isPlaying);

export function MusicPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);
  const playing = useMusicPlaying();
  const music = api.card.music;

  // Выбор = сразу послушать (нажатие пользователя разрешает браузеру включить звук)
  const choose = (m: MusicChoice) => {
    api.patch({ music: m });
    musicPlayer.play(m);
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
        <button className={`tile ${music.kind === 'file' ? 'active' : ''}`} onClick={() => input.current?.click()}>
          <span className="tile-icon">📁</span>
          <span>{music.kind === 'file' ? music.name : t.ui.musicOwn}</span>
        </button>
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
            setError(false);
            choose({ kind: 'file', name: f.name.replace(/\.[^.]+$/, ''), buffer: await decodeAudioFile(f) });
          } catch {
            setError(true);
          }
        }}
      />
      {error && <p className="hint error">{t.ui.musicError}</p>}
      <p className="hint">{t.ui.musicHint}</p>
    </div>
  );
}

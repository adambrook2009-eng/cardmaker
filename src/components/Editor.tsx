import { useEffect, useState } from 'react';
import type { CardApi } from '../state/useCard';
import { useI18n } from '../i18n/I18nProvider';
import { CardCanvas } from './CardCanvas';
import { SendBar } from './SendBar';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { FilterPanel } from './panels/FilterPanel';
import { StickerPanel } from './panels/StickerPanel';
import { FramePanel } from './panels/FramePanel';
import { TextPanel } from './panels/TextPanel';
import { AnimationPanel } from './panels/AnimationPanel';
import { MusicPanel, useMusicPlaying } from './panels/MusicPanel';
import { musicPlayer } from '../engine/audio';
import { EffectsPanel } from './panels/EffectsPanel';
import { PhotosPanel } from './panels/PhotosPanel';

const TABS = [
  { id: 'photos', icon: '📷', Panel: PhotosPanel },
  { id: 'effects', icon: '🔥', Panel: EffectsPanel },
  { id: 'text', icon: '💬', Panel: TextPanel },
  { id: 'background', icon: '🖼️', Panel: BackgroundPanel },
  { id: 'stickers', icon: '🌸', Panel: StickerPanel },
  { id: 'animation', icon: '✨', Panel: AnimationPanel },
  { id: 'music', icon: '🎵', Panel: MusicPanel },
  { id: 'frames', icon: '🔲', Panel: FramePanel },
  { id: 'filters', icon: '🎨', Panel: FilterPanel },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function Editor({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>('photos');
  const { card, selection } = api;

  // Нажали на текст/стикер на открытке — сразу открываем нужные инструменты
  useEffect(() => {
    if (selection?.type === 'text') setTab('text');
    if (selection?.type === 'sticker') setTab('stickers');
  }, [selection]);

  // Ушли из редактора — музыка замолкает
  useEffect(() => () => musicPlayer.stop(), []);

  const playing = useMusicPlaying();
  const Panel = TABS.find((x) => x.id === tab)!.Panel;

  return (
    <div className="editor">
      <div className="preview">
        <div className="canvas-wrap">
        {card.music.kind !== 'none' && (
          <button
            className="music-fab"
            aria-label={playing ? t.ui.musicStop : t.ui.musicPlay}
            onClick={() => (playing ? musicPlayer.stop() : musicPlayer.play(card.music))}
          >
            {playing ? '⏸' : '🎵'}
          </button>
        )}
        <CardCanvas
          card={card}
          selection={selection}
          replayKey={api.replayKey}
          onSelect={api.setSelection}
          onMoveSticker={(id, x, y) => api.updateSticker(id, { x, y })}
          onResizeSticker={(id, size) => api.updateSticker(id, { size })}
          onMoveText={(x, y) => api.patchText({ x, y })}
        />
        </div>
        <SendBar
          card={card}
          onPreview={() => {
            api.replay();
            // с музыкой — и мелодию с начала, чтобы просмотр был как готовое видео
            if (card.music.kind !== 'none') musicPlayer.play(card.music);
          }}
        />
      </div>

      <div className="tools">
        <nav className="tabs">
          {TABS.map((x) => (
            <button key={x.id} className={tab === x.id ? 'active' : ''} onClick={() => setTab(x.id)}>
              <span className="tab-icon">{x.icon}</span>
              <span className="tab-label">{t.tabs[x.id]}</span>
            </button>
          ))}
        </nav>
        <Panel api={api} />
      </div>
    </div>
  );
}

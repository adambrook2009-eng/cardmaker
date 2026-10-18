import { useRef } from 'react';
import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { BACKGROUND_IDS } from '../../engine/backgrounds';
import { drawBackground } from '../../engine/renderer';
import { Thumb } from '../Thumb';

const MAX_PHOTO = 1600;

/** Загружаем фото и сразу уменьшаем — анимация останется плавной даже на слабых телефонах. */
function loadPhoto(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_PHOTO / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function BackgroundPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const bg = api.card.background;

  return (
    <div className="panel">
      <button className="big-action" onClick={() => input.current?.click()}>
        📷 {t.ui.uploadPhoto}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) api.patch({ background: { kind: 'photo', img: await loadPhoto(f) } });
          e.target.value = '';
        }}
      />
      <h3>{t.ui.builtin}</h3>
      <div className="thumb-grid">
        {bg.kind === 'photo' && (
          <button className="thumb-btn active">
            <Thumb draw={(ctx) => drawBackground(ctx, { background: bg }, 'none')} deps={[bg]} />
          </button>
        )}
        {BACKGROUND_IDS.map((id) => (
          <button
            key={id}
            className={`thumb-btn ${bg.kind === 'builtin' && bg.id === id ? 'active' : ''}`}
            onClick={() => api.patch({ background: { kind: 'builtin', id } })}
          >
            <Thumb draw={(ctx) => drawBackground(ctx, { background: { kind: 'builtin', id } }, 'none')} deps={[id]} />
          </button>
        ))}
      </div>
    </div>
  );
}

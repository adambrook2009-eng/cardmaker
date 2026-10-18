import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { FRAMES } from '../../data/options';
import { drawBackground } from '../../engine/renderer';
import { getFrameCanvas } from '../../engine/frames';
import { Thumb } from '../Thumb';

export function FramePanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const { background, filter, frame } = api.card;
  return (
    <div className="panel">
      <div className="thumb-grid">
        {FRAMES.map((id) => (
          <button key={id} className={`thumb-btn labeled ${frame === id ? 'active' : ''}`} onClick={() => api.patch({ frame: id })}>
            <Thumb
              draw={(ctx) => {
                drawBackground(ctx, { background }, filter);
                const f = getFrameCanvas(id);
                if (f) ctx.drawImage(f, 0, 0);
              }}
              deps={[background, filter, id]}
            />
            <span>{t.frames[id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

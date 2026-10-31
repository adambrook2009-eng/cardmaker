import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { BACKGROUND_IDS, isLiveBackground } from '../../engine/backgrounds';
import { drawBackground } from '../../engine/renderer';
import { Thumb } from '../Thumb';

/** Вкладка «Фон»: готовые фоны. Свои фото — на отдельной вкладке «Фото». */
export function BackgroundPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const bg = api.card.background;

  return (
    <div className="panel">
      {/* если сейчас фон — свои фото, к ним можно вернуться отсюда одним нажатием */}
      {bg.kind !== 'photos' && api.photoBg && (
        <button className="big-action secondary" onClick={() => api.setPhotos(api.photoBg!)}>
          ↩ {t.ui.usePhotos}
        </button>
      )}
      <h3>{t.ui.builtin}</h3>
      <p className="hint">▶ — {t.ui.liveBg}</p>
      <div className="thumb-grid">
        {BACKGROUND_IDS.map((id) => (
          <button
            key={id}
            className={`thumb-btn ${bg.kind === 'builtin' && bg.id === id ? 'active' : ''}`}
            onClick={() => api.patch({ background: { kind: 'builtin', id } })}
          >
            <Thumb draw={(ctx) => drawBackground(ctx, { background: { kind: 'builtin', id } }, 'none', 1)} deps={[id]} />
            {isLiveBackground(id) && (
              <span className="live-badge" title={t.ui.liveBg}>
                ▶
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

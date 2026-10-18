import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { ANIMATIONS } from '../../data/options';

export function AnimationPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  return (
    <div className="panel">
      <div className="tile-grid">
        {ANIMATIONS.map((a) => (
          <button key={a.id} className={`tile ${api.card.animation === a.id ? 'active' : ''}`} onClick={() => api.patch({ animation: a.id })}>
            <span className="tile-icon">{a.icon}</span>
            <span>{t.anims[a.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

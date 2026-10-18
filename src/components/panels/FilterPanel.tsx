import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { FILTERS } from '../../data/options';
import { drawBackground } from '../../engine/renderer';
import { Thumb } from '../Thumb';

export function FilterPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const { background, filter } = api.card;
  return (
    <div className="panel">
      <div className="thumb-grid">
        {FILTERS.map((f) => (
          <button key={f.id} className={`thumb-btn labeled ${filter === f.id ? 'active' : ''}`} onClick={() => api.patch({ filter: f.id })}>
            {/* превью фильтра на текущем фоне/фото */}
            <Thumb draw={(ctx) => drawBackground(ctx, { background }, f.id)} deps={[background, f.id]} />
            <span>{t.filters[f.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

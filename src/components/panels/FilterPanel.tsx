import type { CardApi } from '../../state/useCard';
import { NEUTRAL_ADJUST, type ColorAdjust } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { FILTERS } from '../../data/options';
import { drawBackground } from '../../engine/renderer';
import { Thumb } from '../Thumb';

/** Ползунки «Игры с цветом»: диапазон, шаг и подпись значения. */
const SLIDERS: { key: keyof ColorAdjust; icon: string; min: number; max: number; unit: string }[] = [
  { key: 'brightness', icon: '☀️', min: 50, max: 150, unit: '%' },
  { key: 'contrast', icon: '◐', min: 50, max: 150, unit: '%' },
  { key: 'saturate', icon: '🎨', min: 0, max: 200, unit: '%' },
  { key: 'hue', icon: '🌈', min: -180, max: 180, unit: '°' },
  { key: 'warmth', icon: '🌡️', min: -100, max: 100, unit: '' },
  { key: 'fade', icon: '🌫️', min: 0, max: 100, unit: '' },
  { key: 'vignette', icon: '⭕', min: 0, max: 100, unit: '' },
];

const rnd = (a: number, b: number) => Math.round(a + Math.random() * (b - a));

export function FilterPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const { background, filter, adjust } = api.card;
  const changed = SLIDERS.some((s) => adjust[s.key] !== NEUTRAL_ADJUST[s.key]);

  const set = (key: keyof ColorAdjust, v: number) => api.patch({ adjust: { ...adjust, [key]: v } });

  /** Неожиданное, но приятное сочетание: случайный фильтр + умеренные настройки. */
  const surprise = () =>
    api.patch({
      filter: FILTERS[1 + Math.floor(Math.random() * (FILTERS.length - 1))].id,
      adjust: {
        brightness: rnd(92, 112),
        contrast: rnd(90, 125),
        saturate: rnd(80, 150),
        hue: Math.random() < 0.3 ? rnd(-60, 60) : 0,
        warmth: rnd(-40, 50),
        fade: Math.random() < 0.4 ? rnd(10, 40) : 0,
        vignette: rnd(0, 50),
      },
    });

  return (
    <div className="panel">
      <h3>🎛️ {t.ui.colorPlay}</h3>
      <div className="adjust-box">
        {SLIDERS.map((s) => (
          <label key={s.key} className="adjust-row">
            <span className="adjust-name">
              {s.icon} {t.adjust[s.key]}
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              value={adjust[s.key]}
              onChange={(e) => set(s.key, +e.target.value)}
              onDoubleClick={() => set(s.key, NEUTRAL_ADJUST[s.key])}
              className={s.key === 'hue' ? 'hue-range' : s.key === 'warmth' ? 'warmth-range' : ''}
            />
            <span className="adjust-val">
              {adjust[s.key] > 0 && (s.key === 'hue' || s.key === 'warmth') ? '+' : ''}
              {adjust[s.key]}
              {s.unit}
            </span>
          </label>
        ))}
        <div className="adjust-actions">
          <button className="chip" onClick={surprise}>
            🎲 {t.ui.surprise}
          </button>
          <button className="chip" onClick={() => api.patch({ filter: 'none', adjust: { ...NEUTRAL_ADJUST } })} disabled={!changed && filter === 'none'}>
            ↺ {t.ui.resetColors}
          </button>
        </div>
      </div>

      <h3>🖼️ {t.ui.filtersTitle}</h3>
      <div className="thumb-grid">
        {FILTERS.map((f) => (
          <button key={f.id} className={`thumb-btn labeled ${filter === f.id ? 'active' : ''}`} onClick={() => api.patch({ filter: f.id })}>
            {/* превью фильтра на текущем фоне/фото вместе с вашими настройками цвета */}
            <Thumb draw={(ctx) => drawBackground(ctx, { background, adjust }, f.id, 1)} deps={[background, f.id, adjust]} />
            <span>{t.filters[f.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

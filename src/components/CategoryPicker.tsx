import type { CSSProperties } from 'react';
import { CATEGORIES } from '../data/categories';
import { useI18n } from '../i18n/I18nProvider';
import type { CategoryId } from '../types';
import { Thumb } from './Thumb';
import { drawBackground } from '../engine/renderer';

export function CategoryPicker({ onPick }: { onPick: (id: CategoryId) => void }) {
  const { t } = useI18n();
  return (
    <section className="home">
      <h1>{t.chooseCategory}</h1>
      <p className="tagline">{t.tagline}</p>
      <div className="category-grid">
        {CATEGORIES.map((c) => (
          <button key={c.id} className="category-tile" style={{ '--accent': c.color } as CSSProperties} onClick={() => onPick(c.id)}>
            <Thumb draw={(ctx) => drawBackground(ctx, { background: { kind: 'builtin', id: c.defaults.background } }, 'none')} deps={[c.id]} />
            <span className="category-icon">{c.icon}</span>
            <span className="category-name">{t.categories[c.id].name}</span>
            <span className="category-hint">{t.categories[c.id].hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

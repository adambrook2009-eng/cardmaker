import { useI18n } from './i18n/I18nProvider';
import { useCard, type CardApi } from './state/useCard';
import { useEffect } from 'react';
import type { CategoryId } from './types';
import { CATEGORIES, getCategory } from './data/categories';
import { PRESETS } from './data/fx';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import { CategoryPicker } from './components/CategoryPicker';
import { Editor } from './components/Editor';

export default function App() {
  const { t, lang, rtl } = useI18n();
  const api = useCard(lang);
  const { card } = api;

  // Диплинк: ?c=love сразу открывает редактор нужной категории, &p=aurora — с готовым стилем
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const c = q.get('c') as CategoryId | null;
    if (!c || !CATEGORIES.some((x) => x.id === c)) return;
    api.start(c);
    const preset = PRESETS.find((p) => p.id === q.get('p'));
    if (preset) api.applyPreset(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        {card ? (
          <button className="back" onClick={api.reset}>
            {rtl ? '→' : '←'} {t.ui.back}
          </button>
        ) : (
          <span className="logo">💌 {t.appName}</span>
        )}
        {card && (
          <span className="crumb">
            {getCategory(card.category).icon} {t.categories[card.category].name}
          </span>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
      </header>

      <main>{card ? <Editor api={api as CardApi} /> : <CategoryPicker onPick={api.start} />}</main>
    </div>
  );
}

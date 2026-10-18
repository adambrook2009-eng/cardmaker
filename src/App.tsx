import { useI18n } from './i18n/I18nProvider';
import { useCard, type CardApi } from './state/useCard';
import { useEffect } from 'react';
import type { CategoryId } from './types';
import { CATEGORIES, getCategory } from './data/categories';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { CategoryPicker } from './components/CategoryPicker';
import { Editor } from './components/Editor';

export default function App() {
  const { t, lang, rtl } = useI18n();
  const api = useCard(lang);
  const { card } = api;

  // Диплинк: ?c=love сразу открывает редактор нужной категории
  useEffect(() => {
    const c = new URLSearchParams(location.search).get('c') as CategoryId | null;
    if (c && CATEGORIES.some((x) => x.id === c)) api.start(c);
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
      </header>

      <main>{card ? <Editor api={api as CardApi} /> : <CategoryPicker onPick={api.start} />}</main>
    </div>
  );
}

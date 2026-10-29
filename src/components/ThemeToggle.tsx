import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

export type Theme = 'beige' | 'dark';
const KEY = 'cardmaker.theme';

/** Текущая тема: сохранённая или как в системе. Её же ставит скрипт в index.html до загрузки. */
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'beige' || saved === 'dark') return saved;
  } catch {
    /* приватный режим */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'beige';
}

/** Переключатель «тёмный ↔ бежевый» в шапке. */
export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // цвет строки состояния на телефоне — под тему
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#140c22' : '#f4ebdd');
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* не запомним — не страшно */
    }
  }, [theme]);

  const next: Theme = theme === 'dark' ? 'beige' : 'dark';
  return (
    <button className="theme-toggle" onClick={() => setTheme(next)} title={t.ui.themeSwitch} aria-label={t.ui.themeSwitch}>
      <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <span className="theme-label">{next === 'beige' ? t.ui.themeBeige : t.ui.themeDark}</span>
    </button>
  );
}

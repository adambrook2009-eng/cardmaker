import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../types';
import { RTL_LANGS, STRINGS } from './strings';

const KEY = 'cardmaker.lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved && saved in STRINGS) return saved;
  } catch {
    /* приватный режим — не страшно */
  }
  const nav = navigator.language.slice(0, 2);
  return nav === 'he' || nav === 'iw' ? 'he' : nav === 'en' ? 'en' : 'ru';
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof STRINGS)['ru'];
  rtl: boolean;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const rtl = RTL_LANGS.includes(lang);

  useEffect(() => {
    // dir на <html> разворачивает весь интерфейс (flex/grid + логические CSS-свойства)
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.title = STRINGS[lang].appName;
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, rtl]);

  const value = useMemo(() => ({ lang, setLang, t: STRINGS[lang], rtl }), [lang, rtl]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

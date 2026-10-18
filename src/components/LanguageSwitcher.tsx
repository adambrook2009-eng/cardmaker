import { useI18n } from '../i18n/I18nProvider';
import { LANGS } from '../i18n/strings';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch" role="radiogroup" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.id}
          role="radio"
          aria-checked={lang === l.id}
          className={lang === l.id ? 'active' : ''}
          onClick={() => setLang(l.id)}
          title={l.label}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}

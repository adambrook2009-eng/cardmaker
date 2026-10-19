import { useState } from 'react';
import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { PHRASES } from '../../data/phrases';
import { FONTS, TEXT_ANIMS, TEXT_COLORS } from '../../data/options';
import { TEXT_STYLES } from '../../data/fx';

export function TextPanel({ api }: { api: CardApi }) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const { text, category } = api.card;

  return (
    <div className="panel">
      <h3>{t.ui.phrases}</h3>
      <div className="phrase-list">
        {PHRASES[category][lang].map((p, i) => (
          <button key={p} className={`phrase ${api.phraseIdx === i ? 'active' : ''}`} onClick={() => api.choosePhrase(i)}>
            {p}
          </button>
        ))}
      </div>

      <button className="link-btn" onClick={() => setEditing((v) => !v)}>
        ✏️ {t.ui.ownText}
      </button>
      {editing && <textarea className="text-edit" rows={3} value={text.value} onChange={(e) => api.setCustomText(e.target.value)} dir="auto" />}

      <h3>{t.ui.textStyle}</h3>
      <div className="chips">
        {TEXT_STYLES.map((s) => (
          <button key={s.id} className={`chip text-style-${s.id} ${text.style === s.id ? 'active' : ''}`} onClick={() => api.patchText({ style: s.id })}>
            {s.icon} {t.textStyles[s.id]}
          </button>
        ))}
      </div>

      <h3>{t.ui.color}</h3>
      <div className="chips">
        {TEXT_COLORS.map((c) => (
          <button
            key={c}
            className={`swatch ${text.color === c ? 'active' : ''}`}
            style={{ background: c }}
            aria-label={c}
            onClick={() => api.patchText({ color: c })}
          />
        ))}
      </div>

      <h3>{t.ui.font}</h3>
      <div className="chips">
        {FONTS.map((f) => (
          <button key={f.id} className={`chip ${text.font === f.id ? 'active' : ''}`} style={{ fontFamily: f.family }} onClick={() => api.patchText({ font: f.id })}>
            {lang === 'he' ? 'שלום' : lang === 'en' ? 'Hello' : 'Привет'}
          </button>
        ))}
      </div>

      <h3>{t.ui.textEffect}</h3>
      <div className="chips">
        {TEXT_ANIMS.map((a) => (
          <button key={a.id} className={`chip ${text.anim === a.id ? 'active' : ''}`} onClick={() => api.patchText({ anim: a.id })}>
            {a.icon} {t.textAnims[a.id]}
          </button>
        ))}
      </div>

      <h3>{t.ui.size}</h3>
      <input type="range" min={40} max={160} value={text.size} onChange={(e) => api.patchText({ size: +e.target.value })} />
    </div>
  );
}

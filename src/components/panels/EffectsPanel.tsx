import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { CAMERA_LIST, FX_LIST, INTRO_LIST, LOOK_LIST, PRESETS, type Preset } from '../../data/fx';

export function EffectsPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const c = api.card;
  const isPreset = (p: Preset) => c.fx === p.fx && c.look === p.look && c.camera === p.camera && c.intro === p.intro && c.text.style === p.textStyle;

  return (
    <div className="panel">
      <h3>{t.ui.presets}</h3>
      <div className="preset-grid">
        {PRESETS.map((p) => (
          <button key={p.id} className={`preset preset-${p.id} ${isPreset(p) ? 'active' : ''}`} onClick={() => api.applyPreset(p)}>
            <span className="preset-icon">{p.icon}</span>
            <span className="preset-name">{t.presets[p.id].name}</span>
            <span className="preset-hint">{t.presets[p.id].hint}</span>
          </button>
        ))}
      </div>

      <h3>{t.ui.fxTitle}</h3>
      <div className="tile-grid">
        {FX_LIST.map((f) => (
          <button key={f.id} className={`tile ${c.fx === f.id ? 'active' : ''}`} onClick={() => api.patch({ fx: f.id })}>
            <span className="tile-icon">{f.icon}</span>
            <span>{t.fx[f.id]}</span>
          </button>
        ))}
      </div>

      <h3>{t.ui.lookTitle}</h3>
      <div className="chips">
        {LOOK_LIST.map((l) => (
          <button key={l.id} className={`chip ${c.look === l.id ? 'active' : ''}`} onClick={() => api.patch({ look: l.id })}>
            {l.icon} {t.looks[l.id]}
          </button>
        ))}
      </div>

      <h3>{t.ui.cameraTitle}</h3>
      <div className="chips">
        {CAMERA_LIST.map((m) => (
          <button key={m.id} className={`chip ${c.camera === m.id ? 'active' : ''}`} onClick={() => api.patch({ camera: m.id })}>
            {m.icon} {t.cameras[m.id]}
          </button>
        ))}
      </div>

      <h3>{t.ui.introTitle}</h3>
      <div className="chips">
        {INTRO_LIST.map((m) => (
          <button key={m.id} className={`chip ${c.intro === m.id ? 'active' : ''}`} onClick={() => api.patch({ intro: m.id })}>
            {m.icon} {t.intros[m.id]}
          </button>
        ))}
      </div>
      <button className="link-btn" onClick={api.replay}>
        🔁 {t.ui.replay}
      </button>
    </div>
  );
}

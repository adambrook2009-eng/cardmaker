import { useState } from 'react';
import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { CAMERA_LIST, CLEAN_COLORS, FX_LIST, INTRO_LIST, LOOK_LIST, PRESETS, type Preset } from '../../data/fx';

/** Светлый ли цвет — чтобы текст на «чистом экране» всегда был виден. */
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export function EffectsPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const c = api.card;
  const isPreset = (p: Preset) => c.fx === p.fx && c.look === p.look && c.camera === p.camera && c.intro === p.intro && c.text.style === p.textStyle;

  const clean = c.background.kind === 'color' ? c.background : null;
  const [colors, setColors] = useState<string[]>(clean?.colors ?? ['#f4ebdd']);
  const [slot, setSlot] = useState(0); // какой цвет градиента меняем

  /** «Чистый экран»: только цвет + ваш текст и стикеры, без эффектов, рамок и анимации. */
  const applyClean = (cols: string[]) => {
    setColors(cols);
    api.patch({ background: { kind: 'color', colors: cols }, fx: 'none', animation: 'none', frame: 'none', look: 'none', camera: 'none' });
    // текст — контрастный к фону (если сейчас белый/чёрный — меняем, свой цвет пользователя не трогаем)
    const light = isLight(cols[0]) && (cols.length < 2 || isLight(cols[1]));
    if (c.text.color === '#ffffff' || c.text.color === '#111827') api.patchText({ color: light ? '#111827' : '#ffffff' });
  };
  const pickColor = (hex: string) => {
    const next = [...colors];
    next[slot] = hex;
    applyClean(next);
  };
  const toggleGradient = () => {
    const next = colors.length > 1 ? [colors[0]] : [colors[0], colors[0] === '#ffffff' ? '#bdb2ff' : '#ffffff'];
    setSlot(next.length > 1 ? 1 : 0);
    applyClean(next);
  };
  const cleanBg = colors.length > 1 ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` : colors[0];

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

      <h3>{t.ui.cleanTitle}</h3>
      <div className={`clean-box ${clean ? 'active' : ''}`}>
        <button className="clean-apply" style={{ background: cleanBg, color: isLight(colors[0]) ? '#111827' : '#fff' }} onClick={() => applyClean(colors)}>
          <span className="clean-icon">⬜</span>
          <span>
            <b>{t.ui.cleanApply}</b>
            <small>{t.ui.cleanHint}</small>
          </span>
        </button>
        {colors.length > 1 && (
          <div className="chips">
            {[0, 1].map((i) => (
              <button key={i} className={`chip ${slot === i ? 'active' : ''}`} onClick={() => setSlot(i)}>
                <span className="dot" style={{ background: colors[i] }} /> {t.ui.colorN.replace('{n}', String(i + 1))}
              </button>
            ))}
          </div>
        )}
        <div className="chips">
          {CLEAN_COLORS.map((hex) => (
            <button key={hex} className={`swatch ${colors[slot] === hex ? 'active' : ''}`} style={{ background: hex }} aria-label={hex} onClick={() => pickColor(hex)} />
          ))}
          {/* любой свой цвет */}
          <label className="swatch custom" title={t.ui.customColor} style={{ background: colors[slot] }}>
            🎨
            <input type="color" value={colors[slot]} onChange={(e) => pickColor(e.target.value)} />
          </label>
        </div>
        <button className={`chip ${colors.length > 1 ? 'active' : ''}`} onClick={toggleGradient}>
          🌈 {t.ui.gradient}
        </button>
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

import { useState } from 'react';
import type { CardApi } from '../../state/useCard';
import { useI18n } from '../../i18n/I18nProvider';
import { STICKER_PACKS } from '../../data/stickers';
import { getCategory } from '../../data/categories';

export function StickerPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const [pack, setPack] = useState(getCategory(api.card.category).defaults.stickerPack);
  const current = STICKER_PACKS.find((p) => p.id === pack)!;
  const sel = api.selection?.type === 'sticker' ? api.card.stickers.find((s) => s.id === (api.selection as { id: string }).id) : undefined;

  return (
    <div className="panel">
      <div className="chips">
        {STICKER_PACKS.map((p) => (
          <button key={p.id} className={`chip emoji-chip ${pack === p.id ? 'active' : ''}`} onClick={() => setPack(p.id)}>
            {p.icon}
          </button>
        ))}
      </div>
      <div className="emoji-grid">
        {current.items.map((e) => (
          <button key={e} onClick={() => api.addSticker(e)}>
            {e}
          </button>
        ))}
      </div>
      <p className="hint">{t.ui.stickerHint}</p>

      {sel && (
        <div className="selected-tools">
          <span className="sel-emoji">{sel.emoji}</span>
          <label>
            {t.ui.size}
            <input type="range" min={40} max={500} value={sel.size} onChange={(e) => api.updateSticker(sel.id, { size: +e.target.value })} />
          </label>
          <button className="danger" onClick={() => api.removeSticker(sel.id)}>
            🗑️ {t.ui.remove}
          </button>
        </div>
      )}
      {api.card.stickers.length > 0 && (
        <button className="link-btn" onClick={api.clearStickers}>
          {t.ui.clearStickers}
        </button>
      )}
    </div>
  );
}

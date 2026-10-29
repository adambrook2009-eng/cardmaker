import { useEffect, useRef } from 'react';
import type { CardApi } from '../../state/useCard';
import type { AnimId } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { ANIMATIONS } from '../../data/options';
import { createAnimation } from '../../engine/animations';
import { SIZE } from '../../engine/utils';

const PX = 120;

/**
 * Все плитки — живые мини-превью: одна общая петля requestAnimationFrame на всю сетку
 * (дешевле, чем по циклу на плитку) и ~30 кадров/с — экономим батарею телефона.
 */
function useLivePreviews(ids: AnimId[]) {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => {
    const anims = ids.map((id) => createAnimation(id));
    const start = performance.now();
    let raf = 0;
    let frame = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (frame++ % 2) return;
      const t = (performance.now() - start) / 1000;
      anims.forEach((a, i) => {
        const c = refs.current[i];
        if (!c) return;
        const ctx = c.getContext('2d')!;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const g = ctx.createLinearGradient(0, 0, PX, PX);
        g.addColorStop(0, '#2a1a4a');
        g.addColorStop(1, '#5b2a6e');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, PX, PX);
        if (!a) return;
        ctx.scale(PX / SIZE, PX / SIZE);
        a.draw(ctx, t);
      });
    };
    loop();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return refs;
}

export function AnimationPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const refs = useLivePreviews(ANIMATIONS.map((a) => a.id));
  return (
    <div className="panel">
      <div className="anim-grid">
        {ANIMATIONS.map((a, i) => (
          <button key={a.id} className={`anim-tile ${api.card.animation === a.id ? 'active' : ''}`} onClick={() => api.patch({ animation: a.id })}>
            <canvas ref={(el) => (refs.current[i] = el)} width={PX} height={PX} className="anim-preview" />
            {a.id === 'none' && <span className="anim-none">{a.icon}</span>}
            <span className="anim-name">{t.anims[a.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

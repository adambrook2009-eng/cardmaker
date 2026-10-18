import type { AnimId } from '../types';
import { SIZE, heartPath } from './utils';

/** Лёгкая система частиц. Каждая анимация — набор частиц + функция отрисовки по времени t (сек). */
export interface Animation {
  draw(ctx: CanvasRenderingContext2D, t: number): void;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const wrap = (v: number, max: number) => ((v % max) + max) % max;

interface P {
  x: number;
  y: number;
  s: number;
  v: number;
  ph: number;
  c: string;
}

const make = (n: number, f: (i: number) => Partial<P>): P[] =>
  Array.from({ length: n }, (_, i) => ({ x: rnd(0, SIZE), y: rnd(0, SIZE), s: 1, v: 1, ph: rnd(0, 6.28), c: '#fff', ...f(i) }));

const PALETTE = ['#f43f5e', '#fde047', '#22c55e', '#38bdf8', '#a855f7', '#fb923c'];

const FACTORIES: Record<Exclude<AnimId, 'none'>, () => Animation> = {
  snow() {
    const ps = make(140, () => ({ s: rnd(3, 9), v: rnd(40, 120) }));
    return {
      draw(ctx, t) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for (const p of ps) {
          const y = wrap(p.y + t * p.v, SIZE + 20) - 10;
          const x = wrap(p.x + Math.sin(t + p.ph) * 30, SIZE);
          ctx.beginPath();
          ctx.arc(x, y, p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    };
  },
  petals() {
    const ps = make(40, () => ({ s: rnd(10, 20), v: rnd(50, 110), c: Math.random() > 0.5 ? '#fbcfe8' : '#f9a8d4' }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = wrap(p.y + t * p.v, SIZE + 60) - 30;
          const x = wrap(p.x + Math.sin(t * 0.8 + p.ph) * 60 + t * 20, SIZE);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(t * 1.5 + p.ph);
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      },
    };
  },
  lights() {
    // Гирлянда сверху с мерцающими лампочками
    const n = 16;
    const bulbs = Array.from({ length: n }, (_, i) => ({ x: 40 + (i * (SIZE - 80)) / (n - 1), c: PALETTE[i % PALETTE.length], ph: i * 0.9 }));
    const sag = (x: number) => 70 + Math.sin((x / SIZE) * Math.PI) * 80;
    return {
      draw(ctx, t) {
        ctx.strokeStyle = 'rgba(30,30,30,0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x <= SIZE; x += 20) ctx.lineTo(x, sag(x));
        ctx.stroke();
        for (const b of bulbs) {
          const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 3 + b.ph));
          const y = sag(b.x) + 18;
          ctx.globalAlpha = a;
          ctx.shadowColor = b.c;
          ctx.shadowBlur = 30;
          ctx.fillStyle = b.c;
          ctx.beginPath();
          ctx.ellipse(b.x, y, 12, 18, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      },
    };
  },
  sparkles() {
    const ps = make(55, () => ({ s: rnd(8, 22), v: rnd(1.5, 4) }));
    return {
      draw(ctx, t) {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 16;
        for (const p of ps) {
          const k = Math.max(0, Math.sin(t * p.v + p.ph));
          if (k < 0.05) continue;
          const s = p.s * k;
          ctx.globalAlpha = k;
          ctx.beginPath(); // четырёхлучевая звёздочка
          ctx.moveTo(p.x, p.y - s);
          ctx.quadraticCurveTo(p.x, p.y, p.x + s, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + s);
          ctx.quadraticCurveTo(p.x, p.y, p.x - s, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - s);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      },
    };
  },
  hearts() {
    const ps = make(26, () => ({ s: rnd(24, 60), v: rnd(50, 110), c: Math.random() > 0.5 ? '#f43f5e' : '#f472b6' }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = SIZE + 60 - wrap(SIZE - p.y + t * p.v, SIZE + 120);
          const x = p.x + Math.sin(t + p.ph) * 25;
          const pulse = 1 + Math.sin(t * 5 + p.ph) * 0.12;
          ctx.globalAlpha = Math.min(1, y / 300);
          ctx.fillStyle = p.c;
          heartPath(ctx, x, y - (p.s * pulse) / 2, p.s * pulse);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    };
  },
  confetti() {
    const ps = make(110, (i) => ({ s: rnd(10, 20), v: rnd(120, 240), c: PALETTE[i % PALETTE.length] }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = wrap(p.y + t * p.v, SIZE + 40) - 20;
          const x = wrap(p.x + Math.sin(t * 2 + p.ph) * 40, SIZE);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(t * 4 + p.ph);
          ctx.scale(1, Math.cos(t * 6 + p.ph)); // «переворачивание» бумажки
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          ctx.restore();
        }
      },
    };
  },
  bokeh() {
    const ps = make(22, () => ({ s: rnd(30, 90), v: rnd(10, 30) }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = SIZE + 100 - wrap(SIZE - p.y + t * p.v, SIZE + 200);
          const g = ctx.createRadialGradient(p.x, y, 0, p.x, y, p.s);
          const a = 0.18 + 0.12 * Math.sin(t + p.ph);
          g.addColorStop(0, `rgba(255,248,220,${a})`);
          g.addColorStop(1, 'rgba(255,248,220,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, y, p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    };
  },
};

export function createAnimation(id: AnimId): Animation | null {
  return id === 'none' ? null : FACTORIES[id]();
}

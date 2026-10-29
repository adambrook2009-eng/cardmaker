import type { AnimId } from '../types';
import { SIZE, drawEmoji, heartPath } from './utils';

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

type BaseAnim = 'snow' | 'petals' | 'lights' | 'sparkles' | 'hearts' | 'confetti' | 'bokeh';

const FACTORIES: Record<BaseAnim, () => Animation> = {
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

/* ===================== Новые анимации ===================== */

function starPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

function leafPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.7, s * 0.5, 0, s);
  ctx.bezierCurveTo(-s * 0.7, s * 0.5, -s * 0.8, -s * 0.5, 0, -s);
}

const EXTRA: Record<Exclude<AnimId, 'none' | BaseAnim>, () => Animation> = {
  /** Падающие звёзды: вращаются и мерцают. */
  stars() {
    const ps = make(45, () => ({ s: rnd(14, 34), v: rnd(60, 140) }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = wrap(p.y + t * p.v, SIZE + 80) - 40;
          const x = wrap(p.x + Math.sin(t * 0.7 + p.ph) * 30, SIZE);
          const tw = 0.8 + 0.2 * Math.sin(t * 4 + p.ph);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(t * (p.v / 120) + p.ph);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s);
          g.addColorStop(0, '#fffbe6');
          g.addColorStop(1, '#f5b700');
          ctx.fillStyle = g;
          ctx.shadowColor = 'rgba(255,200,0,0.8)';
          ctx.shadowBlur = 12;
          starPath(ctx, p.s * tw);
          ctx.fill();
          ctx.restore();
        }
      },
    };
  },

  /** Золотые монеты: падают и крутятся вокруг своей оси. */
  coins() {
    const ps = make(30, () => ({ s: rnd(20, 36), v: rnd(140, 260) }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = wrap(p.y + t * p.v, SIZE + 80) - 40;
          const spin = Math.cos(t * 5 + p.ph); // -1…1: монета поворачивается ребром
          ctx.save();
          ctx.translate(p.x, y);
          ctx.rotate(Math.sin(t + p.ph) * 0.4);
          ctx.scale(Math.max(0.12, Math.abs(spin)), 1);
          ctx.fillStyle = spin > 0 ? '#fbbf24' : '#d97706';
          ctx.beginPath();
          ctx.arc(0, 0, p.s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255,240,180,0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, p.s * 0.68, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.55)'; // блик
          ctx.beginPath();
          ctx.ellipse(-p.s * 0.35, -p.s * 0.35, p.s * 0.22, p.s * 0.12, -0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      },
    };
  },

  /** Осенние листья: кружатся, переворачиваются, раскачиваются. */
  leaves() {
    const ps = make(34, () => ({ s: rnd(18, 34), v: rnd(50, 110), c: `hsl(${rnd(8, 45)},${rnd(75, 95)}%,${rnd(40, 55)}%)` }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = wrap(p.y + t * p.v, SIZE + 80) - 40;
          const x = wrap(p.x + Math.sin(t * 0.9 + p.ph) * 70 + t * 15, SIZE);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.sin(t * 1.3 + p.ph) * 1.2 + p.ph);
          ctx.scale(1, Math.sin(t * 2 + p.ph)); // «переворот» листа
          ctx.fillStyle = p.c;
          leafPath(ctx, p.s);
          ctx.fill();
          ctx.strokeStyle = 'rgba(90,40,10,0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -p.s * 0.9);
          ctx.lineTo(0, p.s * 1.25); // прожилка и черенок
          ctx.stroke();
          ctx.restore();
        }
      },
    };
  },

  /** Светлячки: блуждают и мягко вспыхивают. */
  fireflies() {
    const ps = make(40, () => ({ s: rnd(3, 6), v: rnd(0.2, 0.6) }));
    return {
      draw(ctx, t) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const p of ps) {
          const x = wrap(p.x + Math.sin(t * p.v + p.ph) * 90 + Math.sin(t * p.v * 2.3) * 30, SIZE);
          const y = wrap(p.y + Math.cos(t * p.v * 1.4 + p.ph) * 70, SIZE);
          const a = Math.max(0, Math.sin(t * (1.5 + p.v) + p.ph * 3));
          if (a < 0.03) continue;
          const g = ctx.createRadialGradient(x, y, 0, x, y, p.s * 9);
          g.addColorStop(0, `rgba(240,255,170,${a})`);
          g.addColorStop(0.25, `rgba(190,255,90,${a * 0.5})`);
          g.addColorStop(1, 'rgba(150,255,60,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - p.s * 9, y - p.s * 9, p.s * 18, p.s * 18);
        }
        ctx.restore();
      },
    };
  },

  /** Ноты: всплывают вверх, покачиваются, переливаются цветом. */
  notes() {
    const glyphs = ['♪', '♫', '♬', '♩'];
    const ps = make(26, (i) => ({ s: rnd(40, 80), v: rnd(50, 100), c: glyphs[i % glyphs.length] }));
    return {
      draw(ctx, t) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const p of ps) {
          const y = SIZE + 60 - wrap(SIZE - p.y + t * p.v, SIZE + 120);
          const x = p.x + Math.sin(t * 1.5 + p.ph) * 35;
          ctx.globalAlpha = Math.min(1, y / 250);
          ctx.font = `700 ${p.s}px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif`;
          ctx.fillStyle = `hsl(${(p.ph * 60 + t * 40) % 360},90%,65%)`;
          ctx.shadowColor = 'rgba(0,0,0,0.35)';
          ctx.shadowBlur = 6;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.sin(t * 2 + p.ph) * 0.3);
          ctx.fillText(p.c, 0, 0);
          ctx.restore();
        }
        ctx.restore();
      },
    };
  },

  /** Серпантин: длинные извивающиеся ленты. */
  ribbons() {
    const ps = make(10, (i) => ({ s: rnd(160, 260), v: rnd(90, 160), c: PALETTE[i % PALETTE.length] }));
    return {
      draw(ctx, t) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const p of ps) {
          const y0 = wrap(p.y + t * p.v, SIZE + p.s + 100) - p.s - 50;
          ctx.strokeStyle = p.c;
          ctx.lineWidth = 9;
          ctx.beginPath();
          for (let k = 0; k <= 24; k++) {
            const yy = y0 + (k / 24) * p.s;
            const xx = p.x + Math.sin(yy * 0.035 + t * 3 + p.ph) * 26;
            if (k === 0) ctx.moveTo(xx, yy);
            else ctx.lineTo(xx, yy);
          }
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'; // блик на ленте
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      },
    };
  },

  /** Дождь из смайликов. */
  emojiRain() {
    const set = ['🎉', '🎈', '💖', '⭐', '🥳', '🌸', '😍', '🎁', '✨', '🍰'];
    const ps = make(38, (i) => ({ s: rnd(36, 70), v: rnd(110, 220), c: set[i % set.length] }));
    return {
      draw(ctx, t) {
        for (const p of ps) {
          const y = wrap(p.y + t * p.v, SIZE + 120) - 60;
          drawEmoji(ctx, p.c, p.x + Math.sin(t + p.ph) * 20, y, p.s, Math.sin(t * 1.5 + p.ph) * 0.5);
        }
      },
    };
  },

  /** Неоновые кольца: расходятся из центра волнами. */
  rings() {
    return {
      draw(ctx, t) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const period = 3.2;
        for (let k = 0; k < 5; k++) {
          const p = ((t + (k * period) / 5) % period) / period;
          const r = 40 + p * SIZE * 0.75;
          const hue = (k * 72 + t * 30) % 360;
          ctx.strokeStyle = `hsla(${hue},100%,65%,${(1 - p) * 0.8})`;
          ctx.lineWidth = 10 * (1 - p) + 2;
          ctx.shadowColor = `hsl(${hue},100%,60%)`;
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.arc(SIZE / 2, SIZE / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      },
    };
  },

  /** Тихий дождь: косые капли и круги на «воде» внизу. */
  rain() {
    const drops = make(170, () => ({ s: rnd(18, 40), v: rnd(700, 1100) }));
    const ripples = make(14, () => ({ y: rnd(SIZE * 0.72, SIZE * 0.98), v: rnd(0.8, 1.6) }));
    return {
      draw(ctx, t) {
        ctx.save();
        ctx.strokeStyle = 'rgba(200,225,255,0.5)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (const d of drops) {
          const y = wrap(d.y + t * d.v, SIZE + 60) - 30;
          const x = wrap(d.x - y * 0.15, SIZE);
          ctx.moveTo(x, y);
          ctx.lineTo(x + d.s * 0.15, y - d.s);
        }
        ctx.stroke();
        for (const r of ripples) {
          const p = ((t * r.v + r.ph) % 1.6) / 1.6;
          ctx.strokeStyle = `rgba(210,235,255,${(1 - p) * 0.6})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, 10 + p * 60, (10 + p * 60) * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      },
    };
  },
};

export function createAnimation(id: AnimId): Animation | null {
  if (id === 'none') return null;
  return id in FACTORIES ? FACTORIES[id as BaseAnim]() : EXTRA[id as Exclude<AnimId, 'none' | BaseAnim>]();
}

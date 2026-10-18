import { EMOJI_FONT } from '../data/stickers';

/** Размер холста открытки (квадрат, удобно для мессенджеров и соцсетей). */
export const SIZE = 1080;

/** Детерминированный ГСЧ — чтобы узоры фона не «прыгали» между кадрами. */
export function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, HTMLCanvasElement>();

/** Рисует тяжёлую статичную графику один раз в offscreen-холст и переиспользует её. */
export function cached(key: string, draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = SIZE;
    draw(c.getContext('2d')!);
    cache.set(key, c);
  }
  return c;
}

/** Сброс кэша (например, когда догрузились веб-шрифты/эмодзи). */
export const clearCache = () => cache.clear();

export function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.closePath();
}

export function drawEmoji(ctx: CanvasRenderingContext2D, emoji: string, x: number, y: number, size: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.font = `${size}px ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

export function linear(ctx: CanvasRenderingContext2D, stops: string[], x1 = 0, y1 = 0, x2 = 0, y2 = SIZE) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

export const isRTL = (s: string) => /[֐-׿؀-ۿ]/.test(s);

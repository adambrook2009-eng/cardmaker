import type { FrameId } from '../types';
import { SIZE, cached, drawEmoji } from './utils';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Эмодзи по периметру открытки. */
function emojiBorder(ctx: CanvasRenderingContext2D, emojis: string[], size: number) {
  const step = size * 1.15;
  const m = size * 0.6;
  let i = 0;
  for (let x = m; x <= SIZE - m + 1; x += step) {
    drawEmoji(ctx, emojis[i++ % emojis.length], x, m, size);
    drawEmoji(ctx, emojis[i++ % emojis.length], x, SIZE - m, size);
  }
  for (let y = m + step; y < SIZE - m - step / 2; y += step) {
    drawEmoji(ctx, emojis[i++ % emojis.length], m, y, size);
    drawEmoji(ctx, emojis[i++ % emojis.length], SIZE - m, y, size);
  }
}

const PAINTERS: Record<Exclude<FrameId, 'none'>, (ctx: CanvasRenderingContext2D) => void> = {
  classic(ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 14;
    roundRect(ctx, 36, 36, SIZE - 72, SIZE - 72, 36);
    ctx.stroke();
  },
  gold(ctx) {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    g.addColorStop(0, '#fde68a');
    g.addColorStop(0.5, '#b45309');
    g.addColorStop(1, '#fcd34d');
    ctx.strokeStyle = g;
    ctx.lineWidth = 18;
    ctx.strokeRect(24, 24, SIZE - 48, SIZE - 48);
    ctx.lineWidth = 5;
    ctx.strokeRect(58, 58, SIZE - 116, SIZE - 116);
  },
  polaroid(ctx) {
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.rect(0, 0, SIZE, SIZE);
    ctx.rect(50, 50, SIZE - 100, SIZE - 220); // «дырка» под фото
    ctx.fill('evenodd');
  },
  hearts: (ctx) => emojiBorder(ctx, ['❤️', '💖', '💕'], 64),
  flowers: (ctx) => emojiBorder(ctx, ['🌸', '🌼', '🌷', '🌺'], 64),
  sparkles: (ctx) => emojiBorder(ctx, ['✨', '⭐', '💫'], 56),
  party(ctx) {
    drawEmoji(ctx, '🎈', 90, 110, 140, -0.2);
    drawEmoji(ctx, '🎉', SIZE - 100, 100, 130, 0.2);
    drawEmoji(ctx, '🎁', 100, SIZE - 100, 120);
    drawEmoji(ctx, '🥳', SIZE - 100, SIZE - 100, 120);
    // гирлянда-флажки сверху
    const colors = ['#f43f5e', '#fde047', '#22c55e', '#38bdf8', '#a855f7'];
    for (let i = 0; i < 9; i++) {
      const x = 200 + i * 80;
      const y = 40 + Math.sin((i / 8) * Math.PI) * 40;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(x - 30, y);
      ctx.lineTo(x + 30, y);
      ctx.lineTo(x, y + 60);
      ctx.fill();
    }
  },
};

export function getFrameCanvas(id: FrameId): HTMLCanvasElement | null {
  if (id === 'none') return null;
  return cached('frame:' + id, PAINTERS[id]);
}

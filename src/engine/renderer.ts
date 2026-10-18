import type { CardState, FilterId, Selection } from '../types';
import { FILTERS, FONTS } from '../data/options';
import { getBackgroundCanvas } from './backgrounds';
import { getFrameCanvas } from './frames';
import type { Animation } from './animations';
import { SIZE, drawEmoji, isRTL } from './utils';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const supportsFilter = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype;

/** Рисует источник «cover» — заполняя квадрат без искажений. */
function drawCover(ctx: CanvasRenderingContext2D, src: CanvasImageSource & { width: number; height: number }) {
  const w = (src as HTMLImageElement).naturalWidth || src.width;
  const h = (src as HTMLImageElement).naturalHeight || src.height;
  const k = Math.max(SIZE / w, SIZE / h);
  ctx.drawImage(src, (SIZE - w * k) / 2, (SIZE - h * k) / 2, w * k, h * k);
}

export function drawBackground(ctx: CanvasRenderingContext2D, state: Pick<CardState, 'background'>, filter: FilterId) {
  const src = state.background.kind === 'photo' ? state.background.img : getBackgroundCanvas(state.background.id);
  ctx.save();
  if (supportsFilter) ctx.filter = FILTERS.find((f) => f.id === filter)!.css;
  drawCover(ctx, src);
  if (filter === 'soft' && supportsFilter) {
    // мягкий фокус: размытая копия поверх оригинала
    ctx.filter = 'blur(10px) brightness(1.1)';
    ctx.globalAlpha = 0.45;
    drawCover(ctx, src);
  }
  ctx.restore();

  if (filter === 'retro') {
    const g = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.3, SIZE / 2, SIZE / 2, SIZE * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(40,20,0,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

function drawText(ctx: CanvasRenderingContext2D, state: CardState, t: number): Box | null {
  const { text } = state;
  if (!text.value.trim()) return null;
  const family = FONTS.find((f) => f.id === text.font)!.family;

  let value = text.value;
  if (text.anim === 'typewriter') {
    const chars = Array.from(value);
    const n = Math.min(chars.length, Math.floor((t * 14) % (chars.length + 25)));
    value = chars.slice(0, n).join('');
  }

  ctx.save();
  ctx.font = `700 ${text.size}px ${family}`;
  ctx.direction = isRTL(text.value) ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Разбиваем на строки по полному тексту, чтобы при «печатной машинке» строки не прыгали
  const fullLines = wrapLines(ctx, text.value, SIZE - 160);
  const lines = text.anim === 'typewriter' ? wrapLines(ctx, value, SIZE - 160) : fullLines;
  const lh = text.size * 1.2;
  const blockH = fullLines.length * lh;
  const blockW = Math.max(...fullLines.map((l) => ctx.measureText(l).width));

  let dy = 0;
  let scale = 1;
  if (text.anim === 'pulse') scale = 1 + Math.sin(t * 4) * 0.06;
  if (text.anim === 'bounce') dy = -Math.abs(Math.sin(t * 3)) * 30;

  ctx.translate(text.x, text.y + dy);
  ctx.scale(scale, scale);

  if (text.anim === 'glow') {
    ctx.shadowColor = text.color;
    ctx.shadowBlur = 20 + Math.sin(t * 3) * 18;
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;
  }
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, text.size / 9);
  ctx.strokeStyle = text.color === '#111827' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)';
  ctx.fillStyle = text.color;

  lines.forEach((line, i) => {
    const y = -blockH / 2 + lh / 2 + i * lh;
    ctx.strokeText(line, 0, y);
    ctx.fillText(line, 0, y);
  });
  ctx.restore();

  return { x: text.x - blockW / 2, y: text.y - blockH / 2, w: blockW, h: blockH };
}

/**
 * Единый рендер кадра: используется и для живого превью, и для экспорта PNG/видео,
 * поэтому «что видишь — то и отправляешь».
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  state: CardState,
  t: number,
  anim: Animation | null,
  selection: Selection = null
): Box | null {
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawBackground(ctx, state, state.filter);
  anim?.draw(ctx, t);
  const frame = getFrameCanvas(state.frame);
  if (frame) ctx.drawImage(frame, 0, 0);

  for (const s of state.stickers) {
    drawEmoji(ctx, s.emoji, s.x, s.y, s.size);
    if (selection?.type === 'sticker' && selection.id === s.id) outline(ctx, s.x - s.size * 0.6, s.y - s.size * 0.6, s.size * 1.2, s.size * 1.2);
  }

  const box = drawText(ctx, state, t);
  if (box && selection?.type === 'text') outline(ctx, box.x - 20, box.y - 14, box.w + 40, box.h + 28);
  return box;
}

function outline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

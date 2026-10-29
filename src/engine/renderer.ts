import type { CameraId, CardState, FilterId, IntroId, Selection } from '../types';
import { FILTERS, FONTS } from '../data/options';
import { getBackgroundCanvas, getLiveBackgroundFrame, isLiveBackground } from './backgrounds';
import { getFrameCanvas } from './frames';
import type { Animation } from './animations';
import type { Effect } from './effects';
import { SIZE, drawEmoji, isRTL } from './utils';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layers {
  anim: Animation | null;
  fx: Effect | null;
}

export interface FrameOpts {
  selection?: Selection;
  /** Громкость музыки 0…1 — эффекты двигаются в такт. */
  level?: number;
  dt?: number;
  /** Подпись песни внизу кадра (в картинке без звука она не нужна). */
  credit?: boolean;
}

const supportsFilter = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype;

/* ---------- Плавности ---------- */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const easeOutBack = (x: number) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;

/* ---------- Фон ---------- */

/** Рисует источник «cover» — заполняя квадрат без искажений. */
function drawCover(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement) {
  const k = Math.max(SIZE / src.width, SIZE / src.height);
  ctx.drawImage(src, (SIZE - src.width * k) / 2, (SIZE - src.height * k) / 2, src.width * k, src.height * k);
}

/** Один кадр фона с фильтром; scale > 1 — приближение от центра (для «зума»). */
function drawLayer(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, filter: FilterId, scale = 1) {
  ctx.save();
  if (scale !== 1) {
    ctx.translate(SIZE / 2, SIZE / 2);
    ctx.scale(scale, scale);
    ctx.translate(-SIZE / 2, -SIZE / 2);
  }
  if (supportsFilter) ctx.filter = FILTERS.find((f) => f.id === filter)!.css;
  drawCover(ctx, src);
  if (filter === 'soft' && supportsFilter) {
    // мягкий фокус: размытая копия поверх оригинала
    ctx.filter = 'blur(10px) brightness(1.1)';
    ctx.globalAlpha *= 0.45;
    drawCover(ctx, src);
  }
  ctx.restore();
}

/** Длительность смены слайдов, секунды. */
const SLIDE_TRANSITION = 0.9;

/**
 * Фон в момент t. Несколько своих фото — слайд-шоу: каждое показывается slideSec секунд,
 * последние 0,9 с плавно сменяется следующим (наплыв, сдвиг или наплыв с медленным приближением).
 */
export function drawBackground(ctx: CanvasRenderingContext2D, state: Pick<CardState, 'background'>, filter: FilterId, t = 0) {
  const bg = state.background;
  if (bg.kind === 'color') {
    // «Чистый экран»: заливка или мягкий диагональный градиент
    if (bg.colors.length > 1) {
      const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      bg.colors.forEach((c, i) => g.addColorStop(i / (bg.colors.length - 1), c));
      ctx.fillStyle = g;
    } else ctx.fillStyle = bg.colors[0];
    ctx.fillRect(0, 0, SIZE, SIZE);
    return;
  }
  if (bg.kind === 'photos' && bg.imgs.length > 1) {
    const n = bg.imgs.length;
    const d = bg.slideSec;
    const idx = Math.floor(t / d) % n;
    const local = t % d;
    const cur = bg.imgs[idx];
    const next = bg.imgs[(idx + 1) % n];
    const k = easeInOutCubic(clamp01((local - (d - SLIDE_TRANSITION)) / SLIDE_TRANSITION));
    // «зум»: каждое фото медленно приближается, пока показывается (эффект Кена Бёрнса)
    const zoom = (lt: number) => (bg.transition === 'zoom' ? 1 + 0.1 * clamp01(lt / d) : 1);

    if (bg.transition === 'slide' && k > 0) {
      ctx.save();
      ctx.translate(-k * SIZE, 0);
      drawLayer(ctx, cur, filter);
      ctx.translate(SIZE, 0);
      drawLayer(ctx, next, filter);
      ctx.restore();
    } else {
      drawLayer(ctx, cur, filter, zoom(local));
      if (k > 0) {
        ctx.save();
        ctx.globalAlpha = k;
        drawLayer(ctx, next, filter, zoom(0));
        ctx.restore();
      }
    }
  } else {
    const src =
      bg.kind === 'photos' ? bg.imgs[0] : isLiveBackground(bg.id) ? getLiveBackgroundFrame(bg.id, t) : getBackgroundCanvas(bg.id);
    drawLayer(ctx, src, filter);
  }

  if (filter === 'retro') {
    const g = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.3, SIZE / 2, SIZE / 2, SIZE * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(40,20,0,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
}

/** Движение «камеры» по фону. Оверлеи остаются на месте — получается параллакс. */
function cameraTransform(ctx: CanvasRenderingContext2D, cam: CameraId, t: number) {
  if (cam === 'none') return;
  const cycle = (period: number) => 0.5 - 0.5 * Math.cos((Math.PI * 2 * t) / period); // 0 → 1 → 0
  let s = 1;
  let x = 0;
  let y = 0;
  let r = 0;
  if (cam === 'zoomIn') s = 1 + 0.18 * cycle(20);
  if (cam === 'zoomOut') s = 1.18 - 0.18 * cycle(20);
  if (cam === 'pan') {
    s = 1.15;
    x = Math.sin((t * Math.PI * 2) / 16) * 70;
    y = Math.sin((t * Math.PI * 2) / 23) * 25;
  }
  if (cam === 'float') {
    s = 1.08 + 0.02 * Math.sin(t * 0.9);
    x = Math.sin(t * 0.7) * 18;
    y = Math.cos(t * 0.55) * 14;
    r = Math.sin(t * 0.45) * 0.012;
  }
  ctx.translate(SIZE / 2 + x, SIZE / 2 + y);
  ctx.rotate(r);
  ctx.scale(s, s);
  ctx.translate(-SIZE / 2, -SIZE / 2);
}

/* ---------- Появление ---------- */

/** Насколько «проявлен» контент (текст, стикеры) к моменту t. */
function revealAt(intro: IntroId, t: number, delay: number) {
  return intro === 'none' ? 1 : clamp01((t - 0.45 - delay) / 0.7);
}

function drawIntro(ctx: CanvasRenderingContext2D, id: IntroId, t: number) {
  if (id === 'none' || t > 2.2) return;
  ctx.save();
  if (id === 'fade') {
    const a = 1 - easeInOutCubic(clamp01(t / 1.3));
    ctx.globalAlpha = a;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  if (id === 'flash') {
    ctx.globalAlpha = Math.min(1, t < 0.1 ? t / 0.1 : Math.exp(-(t - 0.1) * 3.2));
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // ударная волна
    ctx.globalAlpha = Math.max(0, 0.8 - t * 0.7);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, 60 * (1 - Math.min(1, t)));
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, t * 1500, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (id === 'iris') {
    const p = easeInOutCubic(clamp01(t / 1.4));
    if (p < 1) {
      const r = p * SIZE * 0.75;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.rect(0, 0, SIZE, SIZE);
      ctx.arc(SIZE / 2, SIZE / 2, r, 0, Math.PI * 2);
      ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(255,220,140,0.9)';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#ffd27a';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (id === 'curtain') {
    const p = easeInOutCubic(clamp01((t - 0.25) / 1.3));
    if (p < 1) {
      const w = ((1 - p) * SIZE) / 2 + 1;
      const velvet = (x0: number) => {
        const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
        for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? '#a3192d' : '#5a0913');
        return g;
      };
      ctx.fillStyle = velvet(0);
      ctx.fillRect(0, 0, w, SIZE);
      ctx.fillStyle = velvet(SIZE - w);
      ctx.fillRect(SIZE - w, 0, w, SIZE);
      ctx.fillStyle = '#e8b64c';
      ctx.fillRect(w - 8, 0, 8, SIZE);
      ctx.fillRect(SIZE - w, 0, 8, SIZE);
    }
  }
  ctx.restore();
}

/* ---------- Текст ---------- */

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

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${((n >> 16) & 255) * k},${((n >> 8) & 255) * k},${(n & 255) * k})`;
}

function drawText(ctx: CanvasRenderingContext2D, state: CardState, t: number): Box | null {
  const { text } = state;
  if (!text.value.trim()) return null;
  const family = FONTS.find((f) => f.id === text.font)!.family;
  const reveal = revealAt(state.intro, t, 0);
  if (reveal <= 0) return null;

  let value = text.value;
  if (text.anim === 'typewriter') {
    const chars = Array.from(value);
    const tt = Math.max(0, t - (state.intro === 'none' ? 0 : 0.6));
    const n = Math.min(chars.length, Math.floor((tt * 14) % (chars.length + 25)));
    value = chars.slice(0, n).join('');
  }

  ctx.save();
  ctx.font = `700 ${text.size}px ${family}`;
  ctx.direction = isRTL(text.value) ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  // Разбиваем на строки по полному тексту, чтобы при «печатной машинке» строки не прыгали
  const fullLines = wrapLines(ctx, text.value, SIZE - 160);
  const lines = text.anim === 'typewriter' ? wrapLines(ctx, value, SIZE - 160) : fullLines;
  const lh = text.size * 1.2;
  const blockH = fullLines.length * lh;
  const blockW = Math.max(...fullLines.map((l) => ctx.measureText(l).width));
  const ys = lines.map((_, i) => -blockH / 2 + lh / 2 + i * lh);
  const each = (fn: (line: string, y: number) => void) => lines.forEach((l, i) => fn(l, ys[i]));

  let dy = 0;
  let scale = 0.6 + 0.4 * easeOutBack(reveal);
  if (text.anim === 'pulse') scale *= 1 + Math.sin(t * 4) * 0.06;
  if (text.anim === 'bounce') dy = -Math.abs(Math.sin(t * 3)) * 30;

  ctx.translate(text.x, text.y + dy);
  ctx.scale(scale, scale);
  ctx.globalAlpha = clamp01(reveal * 1.5);

  switch (text.style) {
    case 'gold': {
      // объём + металлический градиент + бегущий блик
      ctx.fillStyle = '#4a2c00';
      const depth = Math.max(3, text.size / 14);
      for (let d = depth; d >= 1; d--) each((l, y) => ctx.fillText(l, d * 0.5, y + d));
      each((l, y) => {
        const g = ctx.createLinearGradient(0, y - text.size * 0.5, 0, y + text.size * 0.5);
        g.addColorStop(0, '#fffbe0');
        g.addColorStop(0.3, '#ffe27a');
        g.addColorStop(0.52, '#d79a1e');
        g.addColorStop(0.56, '#b97d0f');
        g.addColorStop(0.8, '#f7d36a');
        g.addColorStop(1, '#fff2b0');
        ctx.lineWidth = text.size / 12;
        ctx.strokeStyle = '#3b2400';
        ctx.strokeText(l, 0, y);
        ctx.fillStyle = g;
        ctx.fillText(l, 0, y);
      });
      const p = ((t * 0.45) % 1.8) - 0.4;
      if (p > -0.15 && p < 1.15) {
        const sh = ctx.createLinearGradient(-blockW / 2, -blockH / 2, blockW / 2, blockH / 2);
        sh.addColorStop(clamp01(p - 0.12), 'rgba(255,255,255,0)');
        sh.addColorStop(clamp01(p), 'rgba(255,255,255,0.95)');
        sh.addColorStop(clamp01(p + 0.12), 'rgba(255,255,255,0)');
        ctx.fillStyle = sh;
        each((l, y) => ctx.fillText(l, 0, y));
      }
      break;
    }
    case 'neon': {
      // трубка неона: широкое свечение → яркий контур → белая «нить»; иногда мигает
      if (Math.sin(t * 31) > 0.985 || Math.sin(t * 17 + 1) > 0.993) ctx.globalAlpha *= 0.55;
      // белый/чёрный неон не бывает — берём яркую неоновую трубку
      const neon = text.color === '#ffffff' || text.color === '#111827' ? '#ff3df2' : text.color;
      const a = ctx.globalAlpha;
      // тёмная подложка — неон читается даже на светлом фоне
      ctx.globalAlpha = a * 0.55;
      ctx.lineWidth = text.size / 5;
      ctx.strokeStyle = 'rgba(10,0,25,0.8)';
      each((l, y) => ctx.strokeText(l, 0, y));
      ctx.globalAlpha = a;
      ctx.strokeStyle = neon;
      ctx.shadowColor = neon;
      ctx.lineWidth = text.size / 12;
      ctx.shadowBlur = 28;
      each((l, y) => ctx.strokeText(l, 0, y));
      ctx.shadowBlur = 10;
      ctx.lineWidth = text.size / 18;
      each((l, y) => ctx.strokeText(l, 0, y));
      ctx.shadowBlur = 0;
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = 'rgba(10,0,25,0.9)';
      each((l, y) => ctx.fillText(l, 0, y));
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#fff6fd';
      ctx.lineWidth = Math.max(2, text.size / 45);
      each((l, y) => ctx.strokeText(l, 0, y));
      break;
    }
    case 'extrude': {
      const depth = Math.max(6, text.size / 7);
      ctx.fillStyle = shade(text.color, 0.45);
      for (let d = depth; d >= 1; d--) each((l, y) => ctx.fillText(l, d * 0.6, y + d * 0.8));
      ctx.lineWidth = text.size / 14;
      ctx.strokeStyle = shade(text.color, 0.3);
      each((l, y) => ctx.strokeText(l, 0, y));
      ctx.fillStyle = text.color;
      each((l, y) => ctx.fillText(l, 0, y));
      break;
    }
    default: {
      if (text.anim === 'glow') {
        ctx.shadowColor = text.color;
        ctx.shadowBlur = 20 + Math.sin(t * 3) * 18;
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 12;
      }
      ctx.lineWidth = Math.max(4, text.size / 9);
      ctx.strokeStyle = text.color === '#111827' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)';
      ctx.fillStyle = text.color;
      each((l, y) => {
        ctx.strokeText(l, 0, y);
        ctx.fillText(l, 0, y);
      });
    }
  }
  ctx.restore();

  return { x: text.x - blockW / 2, y: text.y - blockH / 2, w: blockW, h: blockH };
}

/* ---------- Кадр целиком ---------- */

/**
 * Единый рендер кадра: используется и для живого превью, и для экспорта PNG/видео,
 * поэтому «что видишь — то и отправляешь».
 * Порядок: фон (камера) → спецэффект-фон → анимация → рамка → стикеры → текст → спецэффект-свет → появление.
 */
export function renderScene(ctx: CanvasRenderingContext2D, state: CardState, t: number, layers: Layers, opts: FrameOpts = {}): Box | null {
  const { selection = null, level = 0, dt = 1 / 60 } = opts;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, SIZE, SIZE);

  ctx.save();
  cameraTransform(ctx, state.camera, t);
  drawBackground(ctx, state, state.filter, t);
  ctx.restore();

  if (layers.fx?.layer === 'back') layers.fx.draw(ctx, t, dt, level);
  layers.anim?.draw(ctx, t);
  const frame = getFrameCanvas(state.frame);
  if (frame) ctx.drawImage(frame, 0, 0);

  state.stickers.forEach((s, i) => {
    // стикеры «выпрыгивают» по очереди после появления
    const r = revealAt(state.intro, t, 0.3 + i * 0.08);
    if (r <= 0) return;
    drawEmoji(ctx, s.emoji, s.x, s.y, s.size * easeOutBack(r));
    if (selection?.type === 'sticker' && selection.id === s.id) outline(ctx, s.x - s.size * 0.6, s.y - s.size * 0.6, s.size * 1.2, s.size * 1.2);
  });

  const box = drawText(ctx, state, t);
  if (box && selection?.type === 'text') outline(ctx, box.x - 20, box.y - 14, box.w + 40, box.h + 28);

  if (layers.fx?.layer === 'front') layers.fx.draw(ctx, t, dt, level);
  if (opts.credit !== false && state.music.kind === 'file' && state.music.credit) drawCredit(ctx, state.music.credit);
  drawIntro(ctx, state.intro, t);
  return box;
}

/** Подпись песни — требование лицензии Creative Commons (указать автора). */
function drawCredit(ctx: CanvasRenderingContext2D, text: string) {
  ctx.save();
  ctx.font = `500 26px "Rubik", Arial, sans-serif`;
  const label = `♪ ${text}`;
  const w = Math.min(ctx.measureText(label).width, SIZE - 120) + 32;
  const x = SIZE / 2 - w / 2;
  const y = SIZE - 74;
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(10,5,25,0.55)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 44, 22);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = isRTL(text) ? 'rtl' : 'ltr';
  ctx.fillText(label, SIZE / 2, y + 23, SIZE - 120);
  ctx.restore();
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

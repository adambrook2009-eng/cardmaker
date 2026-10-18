import { SIZE, cached, drawEmoji, heartPath, linear, seeded } from './utils';

type Painter = (ctx: CanvasRenderingContext2D) => void;

/**
 * Встроенная база фонов. Всё рисуется кодом — приложение весит копейки
 * и сразу «наполнено». Сюда же легко добавить фоны-картинки из /public/backgrounds.
 */
const PAINTERS: Record<string, Painter> = {
  sunset(ctx) {
    ctx.fillStyle = linear(ctx, ['#4c1d95', '#db2777', '#f97316', '#fde68a']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const g = ctx.createRadialGradient(540, 760, 20, 540, 760, 260);
    g.addColorStop(0, 'rgba(255,240,180,1)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = 'rgba(60,10,60,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, 900);
    ctx.quadraticCurveTo(300, 800, 540, 880);
    ctx.quadraticCurveTo(800, 960, 1080, 860);
    ctx.lineTo(1080, 1080);
    ctx.lineTo(0, 1080);
    ctx.fill();
  },
  sky(ctx) {
    ctx.fillStyle = linear(ctx, ['#38bdf8', '#bae6fd', '#f0f9ff']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(7);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 6; i++) {
      const x = r() * SIZE, y = 100 + r() * 700, w = 120 + r() * 120;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.ellipse(x + (j - 2) * w * 0.35, y + Math.sin(j) * 15, w * 0.35, w * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  night(ctx) {
    ctx.fillStyle = linear(ctx, ['#020617', '#1e1b4b', '#312e81']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(3);
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`;
      ctx.beginPath();
      ctx.arc(r() * SIZE, r() * SIZE, r() * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fef9c3';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 60;
    ctx.beginPath();
    ctx.arc(820, 230, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(860, 200, 80, 0, Math.PI * 2);
    ctx.fill();
  },
  meadow(ctx) {
    ctx.fillStyle = linear(ctx, ['#7dd3fc', '#e0f2fe']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, 700);
    ctx.quadraticCurveTo(350, 560, 700, 690);
    ctx.quadraticCurveTo(900, 760, 1080, 650);
    ctx.lineTo(1080, 1080);
    ctx.lineTo(0, 1080);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(0, 850);
    ctx.quadraticCurveTo(500, 700, 1080, 830);
    ctx.lineTo(1080, 1080);
    ctx.lineTo(0, 1080);
    ctx.fill();
    const r = seeded(11);
    const flowers = ['🌼', '🌸', '🌷', '🌻'];
    for (let i = 0; i < 28; i++) drawEmoji(ctx, flowers[i % 4], r() * SIZE, 760 + r() * 300, 34 + r() * 30);
  },
  pastel(ctx) {
    ctx.fillStyle = linear(ctx, ['#fbcfe8', '#ddd6fe', '#bfdbfe'], 0, 0, SIZE, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(5);
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.25})`;
      ctx.beginPath();
      ctx.arc(r() * SIZE, r() * SIZE, 40 + r() * 120, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  party(ctx) {
    ctx.fillStyle = linear(ctx, ['#6d28d9', '#c026d3', '#f43f5e'], 0, 0, SIZE, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(9);
    const colors = ['#fde047', '#4ade80', '#38bdf8', '#fb7185', '#ffffff'];
    for (let i = 0; i < 140; i++) {
      ctx.save();
      ctx.translate(r() * SIZE, r() * SIZE);
      ctx.rotate(r() * Math.PI);
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.5 + r() * 0.5;
      ctx.fillRect(-8, -4, 16, 8);
      ctx.restore();
    }
  },
  ocean(ctx) {
    ctx.fillStyle = linear(ctx, ['#0ea5e9', '#0369a1', '#082f49']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let k = 0; k < 7; k++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.08 + k * 0.03})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let x = 0; x <= SIZE; x += 20) ctx.lineTo(x, 520 + k * 80 + Math.sin(x / 80 + k) * 18);
      ctx.stroke();
    }
  },
  love(ctx) {
    ctx.fillStyle = linear(ctx, ['#9f1239', '#e11d48', '#fb7185'], 0, 0, SIZE, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(21);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.06 + r() * 0.12})`;
      heartPath(ctx, r() * SIZE, r() * SIZE, 30 + r() * 110);
      ctx.fill();
    }
  },
  calm(ctx) {
    ctx.fillStyle = linear(ctx, ['#334155', '#64748b', '#cbd5e1']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const g = ctx.createRadialGradient(540, 200, 10, 540, 200, 700);
    g.addColorStop(0, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    drawEmoji(ctx, '🕊️', 540, 250, 140);
  },
  pop(ctx) {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // «Комиксовые» лучи + точки — стиль мемов
    ctx.fillStyle = '#fde047';
    for (let a = 0; a < 24; a++) {
      ctx.beginPath();
      ctx.moveTo(540, 540);
      ctx.arc(540, 540, 900, (a * Math.PI) / 12, (a * Math.PI) / 12 + Math.PI / 24);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(234,88,12,0.18)';
    for (let y = 0; y < SIZE; y += 36)
      for (let x = (y / 36) % 2 ? 18 : 0; x < SIZE; x += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
  },
  cats(ctx) {
    ctx.fillStyle = linear(ctx, ['#ffedd5', '#fed7aa']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalAlpha = 0.35;
    const icons = ['🐱', '🐾', '😺', '🧶'];
    let i = 0;
    for (let y = 60; y < SIZE; y += 150)
      for (let x = (y / 150) % 2 ? 130 : 50; x < SIZE; x += 160) drawEmoji(ctx, icons[i++ % 4], x, y, 64, (i % 3) * 0.2 - 0.2);
    ctx.globalAlpha = 1;
  },
  winter(ctx) {
    ctx.fillStyle = linear(ctx, ['#1e3a8a', '#3b82f6', '#dbeafe']);
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(0, 860);
    ctx.quadraticCurveTo(540, 740, 1080, 860);
    ctx.lineTo(1080, 1080);
    ctx.lineTo(0, 1080);
    ctx.fill();
    const r = seeded(4);
    for (let i = 0; i < 6; i++) drawEmoji(ctx, '🌲', 80 + i * 185 + r() * 40, 800 + r() * 40, 120 + r() * 50);
  },
};

export const BACKGROUND_IDS = Object.keys(PAINTERS);

export const getBackgroundCanvas = (id: string) => cached('bg:' + id, PAINTERS[id] ?? PAINTERS.pastel);

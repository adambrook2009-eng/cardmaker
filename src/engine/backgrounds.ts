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

/* ===================== Продвинутые фоны ===================== */

/** Плавный «шум» (value noise + fBm) — для мрамора, туманностей и гор. */
function makeNoise(seed: number) {
  const r = seeded(seed);
  const perm = Array.from({ length: 512 }, () => r());
  const at = (i: number, j: number) => perm[(((i & 255) + (j & 255) * 157) & 511)];
  const smooth = (f: number) => f * f * (3 - 2 * f);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const sx = smooth(x - xi);
    const sy = smooth(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * sx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * sx;
    return a + (b - a) * sy;
  };
  return (x: number, y: number, octaves = 4) => {
    let v = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < octaves; o++) {
      v += amp * noise(x * f, y * f);
      f *= 2;
      amp *= 0.5;
    }
    return v / (1 - 0.5 ** octaves);
  };
}

/** Попиксельная картинка в низком разрешении + плавное увеличение: быстро и мягко. */
function pixelPaint(ctx: CanvasRenderingContext2D, res: number, px: (u: number, v: number) => [number, number, number]) {
  const c = document.createElement('canvas');
  c.width = c.height = res;
  const g = c.getContext('2d')!;
  const img = g.createImageData(res, res);
  for (let y = 0; y < res; y++)
    for (let x = 0; x < res; x++) {
      const [r, gg, b] = px(x / res, y / res);
      const i = (y * res + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = gg;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c, 0, 0, SIZE, SIZE);
}

const mix = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const PRO: Record<string, Painter> = {
  /** Низкополигональная мозаика: сетка со смещёнными узлами, цвет по положению. */
  lowpoly(ctx) {
    const r = seeded(31);
    const N = 11;
    const step = SIZE / N;
    const pts: [number, number][][] = [];
    for (let j = 0; j <= N; j++) {
      pts.push([]);
      for (let i = 0; i <= N; i++) {
        const edge = i === 0 || j === 0 || i === N || j === N;
        pts[j].push([i * step + (edge ? 0 : (r() - 0.5) * step * 0.8), j * step + (edge ? 0 : (r() - 0.5) * step * 0.8)]);
      }
    }
    const A = hex('#0f172a');
    const B = hex('#6d28d9');
    const C = hex('#ec4899');
    const tri = (p: [number, number][]) => {
      const cx = (p[0][0] + p[1][0] + p[2][0]) / 3 / SIZE;
      const cy = (p[0][1] + p[1][1] + p[2][1]) / 3 / SIZE;
      const k = (cx + cy) / 2;
      let col = k < 0.5 ? mix(A, B, k * 2) : mix(B, C, (k - 0.5) * 2);
      col = col.map((v) => Math.min(255, v * (0.85 + r() * 0.3))) as [number, number, number];
      const s = `rgb(${col.map(Math.round).join(',')})`;
      ctx.fillStyle = s;
      ctx.strokeStyle = s;
      ctx.beginPath();
      ctx.moveTo(...p[0]);
      ctx.lineTo(...p[1]);
      ctx.lineTo(...p[2]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i], d = pts[j + 1][i + 1];
        tri([a, b, d]);
        tri([a, d, c]);
      }
  },

  /** Мрамор: прожилки из «завихрённого» синуса, местами — золото. */
  marble(ctx) {
    const n = makeNoise(5);
    const base = [244, 240, 234];
    const vein = [120, 116, 126];
    const gold = [212, 166, 60];
    pixelPaint(ctx, 360, (u, v) => {
      const w = n(u * 2, v * 2, 6);
      // мягкие широкие прожилки + тонкие «трещинки» + редкое золото
      const s = Math.abs(Math.sin((u * 1.6 + v * 2.2 + w * 3.2) * Math.PI));
      const soft = Math.pow(1 - s, 3) * 0.45;
      const thin = Math.pow(1 - s, 14) * 0.6;
      const goldK = Math.pow(1 - Math.abs(Math.sin((u * 1.1 - v * 1.7 + w * 2.6) * Math.PI)), 40);
      const c = mix(mix(base, vein, Math.min(1, soft + thin)), gold, goldK * 0.9);
      return [c[0] - w * 14, c[1] - w * 14, c[2] - w * 10];
    });
  },

  /** Туманность: цветные облака газа + звёзды разной яркости. */
  nebula(ctx) {
    const n = makeNoise(17);
    const m = makeNoise(29);
    pixelPaint(ctx, 300, (u, v) => {
      const a = Math.max(0, n(u * 2.5, v * 2.5, 5) - 0.35) * 1.8;
      const b = Math.max(0, m(u * 3 + 5, v * 3, 5) - 0.4) * 2;
      return [8 + a * 170 + b * 40, 6 + a * 40 + b * 90, 28 + a * 190 + b * 200];
    });
    const r = seeded(2);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.8})`;
      ctx.beginPath();
      ctx.arc(r() * SIZE, r() * SIZE, r() * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 14; i++) {
      const x = r() * SIZE, y = r() * SIZE, s = 6 + r() * 14;
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(160,190,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(x - s * 1.6, y - 0.75, s * 3.2, 1.5); // лучики
      ctx.fillRect(x - 0.75, y - s * 1.6, 1.5, s * 3.2);
    }
    ctx.restore();
  },

  /** Горы на рассвете: 5 слоёв хребтов, дальние — светлее (воздушная перспектива). */
  mountains(ctx) {
    ctx.fillStyle = linear(ctx, ['#312e81', '#c026d3', '#fb923c', '#fde68a'], 0, 0, 0, SIZE * 0.75);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const sun = ctx.createRadialGradient(SIZE * 0.62, SIZE * 0.55, 10, SIZE * 0.62, SIZE * 0.55, 220);
    sun.addColorStop(0, 'rgba(255,250,220,1)');
    sun.addColorStop(0.25, 'rgba(255,230,170,0.9)');
    sun.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, SIZE, SIZE);
    const n = makeNoise(8);
    const far = hex('#e9a6c7');
    const near = hex('#1e1036');
    for (let L = 0; L < 5; L++) {
      const k = L / 4;
      // хребты от горизонта до самого низа: ближние — ниже и выше по амплитуде
      const base = SIZE * (0.46 + k * 0.5);
      const amp = 110 + L * 45;
      ctx.fillStyle = `rgb(${mix(far, near, k).map(Math.round).join(',')})`;
      ctx.beginPath();
      ctx.moveTo(0, SIZE);
      for (let x = 0; x <= SIZE; x += 6) ctx.lineTo(x, base - n(x / 260 + L * 7, L, 4) * amp);
      ctx.lineTo(SIZE, SIZE);
      ctx.fill();
      // дымка между слоями
      const mist = ctx.createLinearGradient(0, base - amp * 0.3, 0, base + 60);
      mist.addColorStop(0, 'rgba(255,220,230,0)');
      mist.addColorStop(1, `rgba(255,220,230,${0.18 - k * 0.03})`);
      ctx.fillStyle = mist;
      ctx.fillRect(0, base - amp, SIZE, amp + 80);
    }
  },

  /** Ночной город: три плана домов, горящие окна, луна. */
  city(ctx) {
    ctx.fillStyle = linear(ctx, ['#020617', '#1e1b4b', '#7c2d8f'], 0, 0, 0, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(13);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(255,255,255,${r() * 0.7})`;
      ctx.fillRect(r() * SIZE, r() * SIZE * 0.5, 1.6, 1.6);
    }
    ctx.fillStyle = '#fef3c7';
    ctx.shadowColor = '#fde68a';
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(SIZE * 0.78, SIZE * 0.2, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    const layers = [
      { col: '#2a1a4a', h: [0.35, 0.6], w: [60, 120], win: 0.15 },
      { col: '#1a1033', h: [0.25, 0.5], w: [70, 140], win: 0.3 },
      { col: '#0b0618', h: [0.15, 0.35], w: [80, 160], win: 0.45 },
    ];
    for (const L of layers) {
      let x = -20;
      while (x < SIZE) {
        const w = L.w[0] + r() * (L.w[1] - L.w[0]);
        const h = SIZE * (L.h[0] + r() * (L.h[1] - L.h[0]));
        const top = SIZE - h;
        ctx.fillStyle = L.col;
        ctx.fillRect(x, top, w, h);
        if (r() > 0.6) ctx.fillRect(x + w * 0.4, top - 40, 6, 40); // антенна
        for (let wy = top + 14; wy < SIZE - 10; wy += 22)
          for (let wx = x + 10; wx < x + w - 12; wx += 18)
            if (r() < L.win) {
              ctx.fillStyle = r() > 0.15 ? 'rgba(255,214,120,0.9)' : 'rgba(150,200,255,0.8)';
              ctx.fillRect(wx, wy, 8, 11);
            }
        x += w + 4;
      }
    }
  },

  /** Огни боке: размытые цветные круги на тёмном. */
  bokehLights(ctx) {
    ctx.fillStyle = linear(ctx, ['#0c0a1f', '#2d1b4e', '#1a0f2e'], 0, 0, SIZE, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(44);
    const hues = [330, 280, 45, 190, 15];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const x = r() * SIZE, y = r() * SIZE, s = 20 + r() * 110;
      const h = hues[Math.floor(r() * hues.length)];
      const g = ctx.createRadialGradient(x, y, s * 0.6, x, y, s);
      g.addColorStop(0, `hsla(${h},90%,65%,${0.15 + r() * 0.2})`);
      g.addColorStop(0.9, `hsla(${h},90%,70%,${0.2 + r() * 0.2})`);
      g.addColorStop(1, `hsla(${h},90%,70%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  /** Градиентная сетка: большие размытые пятна цвета (как у современных приложений). */
  meshGradient(ctx) {
    ctx.fillStyle = '#ff7eb3';
    ctx.fillRect(0, 0, SIZE, SIZE);
    const blobs: [number, number, number, string][] = [
      [0.15, 0.2, 0.55, '#7c3aed'],
      [0.85, 0.15, 0.5, '#f59e0b'],
      [0.8, 0.85, 0.55, '#06b6d4'],
      [0.2, 0.85, 0.5, '#ef4444'],
      [0.5, 0.5, 0.35, '#fde047'],
    ];
    for (const [x, y, rad, col] of blobs) {
      const g = ctx.createRadialGradient(x * SIZE, y * SIZE, 0, x * SIZE, y * SIZE, rad * SIZE);
      g.addColorStop(0, col);
      g.addColorStop(1, col + '00');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }
  },

  /** Золотой блеск на тёмном: тысячи искр + мягкий отблеск. */
  goldGlitter(ctx) {
    ctx.fillStyle = linear(ctx, ['#0a0705', '#2a1b0a', '#0a0705'], 0, 0, SIZE, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const glow = ctx.createRadialGradient(SIZE * 0.3, SIZE * 0.25, 0, SIZE * 0.3, SIZE * 0.25, SIZE * 0.8);
    glow.addColorStop(0, 'rgba(255,200,90,0.35)');
    glow.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(77);
    for (let i = 0; i < 4500; i++) {
      // искр больше по диагонали — «россыпь»
      const t = r();
      const x = t * SIZE + (r() - 0.5) * 500;
      const y = (1 - t) * SIZE + (r() - 0.5) * 500;
      const l = 45 + r() * 40;
      ctx.fillStyle = `hsla(${38 + r() * 12},90%,${l}%,${0.3 + r() * 0.7})`;
      const s = r() * 2.6 + 0.4;
      ctx.fillRect(x, y, s, s);
    }
    for (let i = 0; i < 25; i++) drawEmoji(ctx, '✨', r() * SIZE, r() * SIZE, 18 + r() * 22);
  },

  /** Подводный мир: лучи света сверху, пузырьки, водоросли. */
  underwater(ctx) {
    ctx.fillStyle = linear(ctx, ['#22d3ee', '#0369a1', '#082f49', '#03131f'], 0, 0, 0, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(19);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = r() * SIZE;
      const w = 40 + r() * 90;
      const g = ctx.createLinearGradient(0, 0, 0, SIZE * 0.9);
      g.addColorStop(0, 'rgba(200,250,255,0.28)');
      g.addColorStop(1, 'rgba(200,250,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + w, 0);
      ctx.lineTo(x + w * 2.5 + 150, SIZE * 0.9);
      ctx.lineTo(x + 150, SIZE * 0.9);
      ctx.fill();
    }
    ctx.restore();
    // водоросли
    for (let i = 0; i < 14; i++) {
      const x = r() * SIZE;
      const h = 150 + r() * 260;
      ctx.strokeStyle = `hsl(${140 + r() * 30},60%,${18 + r() * 15}%)`;
      ctx.lineWidth = 10 + r() * 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, SIZE + 10);
      ctx.bezierCurveTo(x - 40, SIZE - h * 0.4, x + 50, SIZE - h * 0.7, x + (r() - 0.5) * 60, SIZE - h);
      ctx.stroke();
    }
    // песчаное дно
    ctx.fillStyle = '#c2a36b';
    ctx.beginPath();
    ctx.moveTo(0, SIZE);
    for (let x = 0; x <= SIZE; x += 20) ctx.lineTo(x, SIZE - 50 - Math.sin(x / 90) * 18);
    ctx.lineTo(SIZE, SIZE);
    ctx.fill();
    // пузырьки
    for (let i = 0; i < 40; i++) {
      const x = r() * SIZE, y = r() * SIZE * 0.85, s = 3 + r() * 12;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.stroke();
    }
  },

  /** Цветущая сакура: ветка сверху, цветы, лепестки в воздухе. */
  sakura(ctx) {
    ctx.fillStyle = linear(ctx, ['#fde7ef', '#fbcfe8', '#fff7ed'], 0, 0, 0, SIZE);
    ctx.fillRect(0, 0, SIZE, SIZE);
    const r = seeded(23);
    const flower = (x: number, y: number, s: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      for (let p = 0; p < 5; p++) {
        ctx.rotate((Math.PI * 2) / 5);
        const g = ctx.createLinearGradient(0, 0, 0, -s);
        g.addColorStop(0, '#f472b6');
        g.addColorStop(1, '#fff1f6');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s * 0.55, -s * 0.35, -s * 0.4, -s, 0, -s * 0.85);
        ctx.bezierCurveTo(s * 0.4, -s, s * 0.55, -s * 0.35, 0, 0);
        ctx.fill();
      }
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    // ветка с отростками
    ctx.strokeStyle = '#5b3a29';
    ctx.lineCap = 'round';
    const branch = (x: number, y: number, ang: number, len: number, w: number, depth: number) => {
      const x2 = x + Math.cos(ang) * len;
      const y2 = y + Math.sin(ang) * len;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo((x + x2) / 2 + 20, (y + y2) / 2 - 20, x2, y2);
      ctx.stroke();
      if (depth > 0) {
        branch(x2, y2, ang + 0.5 + r() * 0.3, len * 0.65, w * 0.6, depth - 1);
        branch(x2, y2, ang - 0.4 - r() * 0.3, len * 0.7, w * 0.65, depth - 1);
      }
      for (let i = 0; i < 3 + depth; i++) flower(x + (x2 - x) * r(), y + (y2 - y) * r() + (r() - 0.5) * 30, 18 + r() * 16, r() * 6);
    };
    branch(-40, 120, 0.18, 420, 26, 3);
    // лепестки в воздухе
    for (let i = 0; i < 40; i++) {
      ctx.save();
      ctx.translate(r() * SIZE, SIZE * 0.3 + r() * SIZE * 0.7);
      ctx.rotate(r() * 6);
      ctx.fillStyle = `rgba(244,114,182,${0.4 + r() * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
Object.assign(PAINTERS, PRO);

/* ---------- «Живые» фоны: рисуются заново в каждом кадре ---------- */

type LivePainter = (ctx: CanvasRenderingContext2D, t: number) => void;

const LIVE: Record<string, LivePainter> = {
  /** Жидкий градиент: большие цветные пятна плавно перетекают. */
  liquid(ctx, t) {
    ctx.fillStyle = '#1a0b2e';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const blobs = [
      [0.3, 0.3, 0.6, 280, 0.21, 0],
      [0.7, 0.3, 0.55, 330, 0.17, 2],
      [0.6, 0.75, 0.6, 200, 0.13, 4],
      [0.25, 0.7, 0.5, 20, 0.19, 1],
      [0.5, 0.5, 0.4, 50, 0.23, 3],
    ];
    for (const [x, y, rad, hue, sp, ph] of blobs) {
      const cx = (x + Math.sin(t * sp * 2 + ph) * 0.18) * SIZE;
      const cy = (y + Math.cos(t * sp * 1.6 + ph) * 0.18) * SIZE;
      const h = (hue + t * 8) % 360;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad * SIZE);
      g.addColorStop(0, `hsla(${h},90%,52%,0.6)`);
      g.addColorStop(1, `hsla(${h},90%,45%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }
    ctx.restore();
  },

  /** Морские волны: небо, солнце и 6 слоёв волн, бегущих с разной скоростью. */
  waves(ctx, t) {
    ctx.fillStyle = linear(ctx, ['#fb7185', '#fdba74', '#fde68a'], 0, 0, 0, SIZE * 0.55);
    ctx.fillRect(0, 0, SIZE, SIZE * 0.55);
    ctx.fillStyle = 'rgba(255,248,220,0.95)';
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE * 0.5, 110, Math.PI, 0);
    ctx.fill();
    for (let L = 0; L < 6; L++) {
      const k = L / 5;
      const base = SIZE * (0.5 + k * 0.42);
      const amp = 14 + L * 7;
      const speed = 0.6 + L * 0.35;
      ctx.fillStyle = `hsl(${205 - L * 4},${70 + L * 3}%,${55 - L * 7}%)`;
      ctx.beginPath();
      ctx.moveTo(0, SIZE);
      for (let x = 0; x <= SIZE; x += 12)
        ctx.lineTo(x, base + Math.sin(x / (90 + L * 20) + t * speed + L) * amp + Math.sin(x / 37 - t * speed * 1.7) * amp * 0.3);
      ctx.lineTo(SIZE, SIZE);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${0.35 - k * 0.2})`; // пена на гребне
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  },

  /** Радужный перелив: медленно вращающийся многоцветный градиент. */
  rainbow(ctx, t) {
    const a = t * 0.25;
    const cx = SIZE / 2;
    const R = SIZE * 0.75;
    const g = ctx.createLinearGradient(cx + Math.cos(a) * R, cx + Math.sin(a) * R, cx - Math.cos(a) * R, cx - Math.sin(a) * R);
    for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${(i * 60 + t * 25) % 360},85%,62%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
    const v = ctx.createRadialGradient(cx, cx, SIZE * 0.2, cx, cx, SIZE * 0.75);
    v.addColorStop(0, 'rgba(255,255,255,0.15)');
    v.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, SIZE, SIZE);
  },
};

export const isLiveBackground = (id: string) => id in LIVE;

const liveCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

/** Кадр «живого» фона в момент t (в общий холст — без лишних выделений памяти). */
export function getLiveBackgroundFrame(id: string, t: number): HTMLCanvasElement {
  const c = liveCanvas!;
  if (c.width !== SIZE) c.width = c.height = SIZE;
  LIVE[id](c.getContext('2d')!, t);
  return c;
}

export const BACKGROUND_IDS = [...Object.keys(PAINTERS), ...Object.keys(LIVE)];

export const getBackgroundCanvas = (id: string) => cached('bg:' + id, PAINTERS[id] ?? PAINTERS.pastel);

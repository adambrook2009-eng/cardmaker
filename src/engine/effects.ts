import type { FxId } from '../types';
import { SIZE } from './utils';

/**
 * Спецэффекты «киношного» уровня. В отличие от лёгких анимаций, у них есть состояние
 * (физика частиц), они рисуются светом (аддитивное смешивание 'lighter'/'screen')
 * и реагируют на музыку через level (0…1).
 */
export interface Effect {
  /** back — под текстом и стикерами, front — поверх всего (свет «в объектив»). */
  layer: 'back' | 'front';
  draw(ctx: CanvasRenderingContext2D, t: number, dt: number, level: number): void;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/* ---------- Светящиеся спрайты ---------- */

const sprites = new Map<string, HTMLCanvasElement>();

/** Мягкое пятно света. Рисуется один раз, дальше только drawImage — быстро даже на телефоне. */
export function glow(hue: number, sat = 100, light = 60): HTMLCanvasElement {
  const key = `${Math.round(hue / 10) * 10}|${sat}|${light}`;
  let c = sprites.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `hsla(${hue},${sat}%,${Math.min(100, light + 35)}%,1)`);
    gr.addColorStop(0.2, `hsla(${hue},${sat}%,${light}%,0.8)`);
    gr.addColorStop(0.5, `hsla(${hue},${sat}%,${light}%,0.2)`);
    gr.addColorStop(1, `hsla(${hue},${sat}%,${light}%,0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    sprites.set(key, c);
  }
  return c;
}

function blit(ctx: CanvasRenderingContext2D, sprite: HTMLCanvasElement, x: number, y: number, size: number, alpha: number) {
  if (alpha <= 0.003) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
}

function star4(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.fill();
}

/* ---------- Салют ---------- */

function fireworks(): Effect {
  interface Rocket { x: number; y: number; vx: number; vy: number; hue: number }
  interface Spark { x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; max: number; hue: number; size: number; drag: number; grav: number }
  const rockets: Rocket[] = [];
  const sparks: Spark[] = [];
  let timer = 0.2;
  let cooldown = 0;
  let flash = 0;
  let flashHue = 0;
  let prevLevel = 0;

  const launch = () => rockets.push({ x: rnd(180, SIZE - 180), y: SIZE + 20, vx: rnd(-60, 60), vy: -rnd(950, 1200), hue: rnd(0, 360) });

  const explode = (r: Rocket) => {
    const kind = Math.random();
    const gold = kind > 0.72; // «золотая ива» — долгие мерцающие искры
    const ring = kind < 0.32;
    const n = 150;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.05, 0.05);
      const sp = ring ? 420 : rnd(90, 480);
      sparks.push({
        x: r.x, y: r.y, px: r.x, py: r.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0, max: gold ? rnd(2, 2.8) : rnd(1.3, 2),
        hue: gold ? 42 : r.hue + rnd(-20, 20),
        size: gold ? 3 : rnd(3.5, 5.5),
        drag: gold ? 0.962 : 0.975,
        grav: gold ? 120 : 220,
      });
    }
    flash = 1;
    flashHue = gold ? 42 : r.hue;
  };

  return {
    layer: 'back',
    draw(ctx, _t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      timer -= dt;
      cooldown -= dt;
      // Залп в такт музыке: резкий рост громкости = удар
      const punch = level - prevLevel;
      prevLevel = level;
      if (timer <= 0 || (punch > 0.12 && cooldown <= 0)) {
        launch();
        if (Math.random() < 0.35) launch(); // двойной залп
        timer = rnd(0.45, 0.95);
        cooldown = 0.35;
      }

      ctx.save();
      // «Ночь»: приглушаем фон, чтобы салют сиял на любом изображении, даже на ярком фото
      ctx.fillStyle = 'rgba(8,4,30,0.42)';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      if (flash > 0.01) {
        ctx.globalAlpha = flash * 0.1;
        ctx.fillStyle = `hsl(${flashHue},100%,60%)`;
        ctx.fillRect(0, 0, SIZE, SIZE);
        flash *= Math.pow(0.02, dt);
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.vy += 700 * dt;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        blit(ctx, glow(r.hue, 80, 70), r.x, r.y, 40, 0.9);
        sparks.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: rnd(-20, 20), vy: rnd(20, 60), life: 0, max: 0.5, hue: 35, size: 1.5, drag: 0.95, grav: 100 });
        if (r.vy > -120) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      const k = 60 * dt;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.max) {
          sparks.splice(i, 1);
          continue;
        }
        s.px = s.x;
        s.py = s.y;
        const d = Math.pow(s.drag, k);
        s.vx *= d;
        s.vy = s.vy * d + s.grav * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const a = 1 - s.life / s.max;
        const tw = s.max > 2 ? 0.6 + 0.4 * Math.sin(s.life * 40) : 1;
        ctx.globalAlpha = a * tw;
        ctx.strokeStyle = `hsl(${s.hue},100%,${60 + a * 25}%)`;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(s.x + (s.x - s.px) * 2, s.y + (s.y - s.py) * 2);
        ctx.stroke();
        blit(ctx, glow(s.hue), s.x, s.y, s.size * 14, a * 0.6 * tw);
      }
      ctx.restore();
    },
  };
}

/* ---------- Северное сияние ---------- */

function aurora(): Effect {
  const bands = [
    { hue: 140, y: 160, h: 330, sp: 0.5 },
    { hue: 170, y: 240, h: 280, sp: 0.7 },
    { hue: 285, y: 120, h: 260, sp: 0.4 },
  ];
  const strips = bands.map((b) => {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, `hsla(${b.hue + 20},100%,60%,0)`);
    gr.addColorStop(0.55, `hsla(${b.hue},100%,55%,0.35)`);
    gr.addColorStop(0.85, `hsla(${b.hue - 10},100%,65%,0.9)`);
    gr.addColorStop(1, `hsla(${b.hue - 10},100%,70%,0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 256);
    return c;
  });
  const N = 90;
  const w = SIZE / N;
  return {
    layer: 'back',
    draw(ctx, t, _dt, level) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      bands.forEach((b, bi) => {
        for (let i = 0; i <= N; i++) {
          const x = i * w;
          const y = b.y + Math.sin(x * 0.004 + t * b.sp + bi) * 70 + Math.sin(x * 0.013 - t * b.sp * 1.7) * 25;
          const h = b.h + Math.sin(x * 0.006 + t * 0.6 + bi * 2) * 110;
          const a = 0.45 + 0.35 * Math.sin(x * 0.02 + t * 1.3 + bi * 1.7) + level * 0.4;
          ctx.globalAlpha = Math.max(0, Math.min(1, a));
          ctx.drawImage(strips[bi], x, y, w + 1.5, h);
        }
      });
      ctx.restore();
    },
  };
}

/* ---------- Кинозасветки (light leaks) ---------- */

function lightLeaks(): Effect {
  const blobs = [
    { hue: 25, x: 0, y: 0, r: 620, sx: 0.21, sy: 0.17, ph: 0 },
    { hue: 340, x: SIZE, y: 200, r: 520, sx: 0.15, sy: 0.23, ph: 2 },
    { hue: 45, x: SIZE, y: SIZE, r: 560, sx: 0.19, sy: 0.13, ph: 4 },
    { hue: 10, x: 0, y: SIZE * 0.8, r: 480, sx: 0.12, sy: 0.2, ph: 1 },
  ];
  return {
    layer: 'front',
    draw(ctx, t, _dt, level) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const b of blobs) {
        const x = b.x + Math.sin(t * b.sx * 2 + b.ph) * 260;
        const y = b.y + Math.cos(t * b.sy * 2 + b.ph) * 220;
        const a = Math.min(1, 0.32 + 0.18 * Math.sin(t * 0.7 + b.ph) + level * 0.2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, `hsla(${b.hue},100%,62%,${a})`);
        g.addColorStop(0.5, `hsla(${b.hue},100%,55%,${a * 0.35})`);
        g.addColorStop(1, `hsla(${b.hue},100%,50%,0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, SIZE, SIZE);
      }
      // Диагональная «вспышка плёнки» каждые 7 секунд
      const cx = -400 + ((t % 7) / 7) * (SIZE + 800);
      const g = ctx.createLinearGradient(cx - 260, 0, cx + 260, SIZE * 0.4);
      g.addColorStop(0, 'rgba(255,220,180,0)');
      g.addColorStop(0.5, 'rgba(255,220,180,0.28)');
      g.addColorStop(1, 'rgba(255,220,180,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.restore();
    },
  };
}

/* ---------- Блик объектива ---------- */

function lensFlare(): Effect {
  const ghosts = [
    { k: 0.35, s: 70, h: 200, a: 0.25 },
    { k: 0.6, s: 140, h: 280, a: 0.14 },
    { k: 0.85, s: 40, h: 40, a: 0.35 },
    { k: 1.15, s: 200, h: 160, a: 0.1 },
    { k: 1.4, s: 90, h: 20, a: 0.2 },
    { k: 1.75, s: 260, h: 220, a: 0.08 },
  ];
  return {
    layer: 'front',
    draw(ctx, t, _dt, level) {
      const sx = SIZE * 0.5 + Math.sin(t * 0.22) * SIZE * 0.38;
      const sy = SIZE * 0.2 + Math.cos(t * 0.22) * 90;
      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const pulse = 1 + level * 0.6 + Math.sin(t * 3) * 0.04;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      blit(ctx, glow(40, 100, 65), sx, sy, 620 * pulse, 0.75);
      blit(ctx, glow(50, 100, 90), sx, sy, 160 * pulse, 1);
      // анаморфная полоса, как в голливудских объективах
      ctx.globalAlpha = 0.55;
      ctx.drawImage(glow(205, 100, 65), sx - 760 * pulse, sy - 16, 1520 * pulse, 32);
      ctx.globalAlpha = 0.9;
      ctx.drawImage(glow(200, 100, 85), sx - 260, sy - 4, 520, 8);
      // лучи
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.1);
      for (let i = 0; i < 10; i++) {
        ctx.rotate(Math.PI / 5);
        ctx.globalAlpha = 0.16 + 0.08 * Math.sin(t * 2 + i);
        const len = 320 + 120 * Math.sin(t * 1.3 + i * 1.7);
        ctx.drawImage(glow(45, 100, 75), -6, 0, 12, len);
      }
      ctx.restore();
      // «призраки» вдоль оси через центр кадра
      for (const g of ghosts) {
        const gx = sx + (cx - sx) * g.k * 1.6;
        const gy = sy + (cy - sy) * g.k * 1.6;
        blit(ctx, glow(g.h, 90, 60), gx, gy, g.s, g.a * pulse);
        ctx.globalAlpha = g.a * 0.6;
        ctx.strokeStyle = `hsl(${g.h},100%,70%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(gx, gy, g.s * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    },
  };
}

/* ---------- Золотая пыль ---------- */

function goldDust(): Effect {
  const ps = Array.from({ length: 170 }, () => ({ x: rnd(0, SIZE), y: rnd(0, SIZE), z: Math.random() ** 1.5 * 0.9 + 0.1, ph: rnd(0, 6.28), hue: rnd(35, 50) }));
  const bokeh = Array.from({ length: 9 }, () => ({ x: rnd(0, SIZE), y: rnd(0, SIZE), r: rnd(60, 140), ph: rnd(0, 6.28) }));
  return {
    layer: 'front',
    draw(ctx, t, dt, level) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const b of bokeh) {
        const y = (((b.y - t * 12) % SIZE) + SIZE) % SIZE;
        blit(ctx, glow(42, 90, 55), b.x + Math.sin(t * 0.3 + b.ph) * 40, y, b.r * 2, 0.1 + 0.05 * Math.sin(t + b.ph));
      }
      for (const p of ps) {
        p.y -= (8 + 40 * p.z) * dt;
        p.x += Math.sin(t * 0.8 + p.ph) * 12 * dt * p.z;
        if (p.y < -20) {
          p.y = SIZE + 20;
          p.x = rnd(0, SIZE);
        }
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1.5 + p.z * 2) + p.ph));
        const s = 3 + 9 * p.z;
        blit(ctx, glow(p.hue, 100, 62), p.x, p.y, s * (4 + level * 3), tw * p.z * 0.9);
      }
      ctx.restore();
    },
  };
}

/* ---------- Волшебная палочка ---------- */

function magic(): Effect {
  const sparks: { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number; s: number }[] = [];
  let acc = 0;
  return {
    layer: 'front',
    draw(ctx, t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      const ox = SIZE / 2 + Math.sin(t * 0.9) * 380;
      const oy = SIZE / 2 + Math.sin(t * 1.37 + 1) * 300;
      acc += dt * (140 + level * 200);
      while (acc >= 1) {
        acc -= 1;
        const a = rnd(0, 6.28);
        const sp = rnd(10, 90);
        sparks.push({ x: ox + rnd(-6, 6), y: oy + rnd(-6, 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rnd(0.8, 1.6), hue: (t * 70 + rnd(-30, 30) + 360) % 360, s: rnd(5, 13) });
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#fff';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life += dt;
        if (p.life >= p.max) {
          sparks.splice(i, 1);
          continue;
        }
        p.vy += 40 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const a = 1 - p.life / p.max;
        const s = p.s * a;
        blit(ctx, glow(p.hue, 100, 70), p.x, p.y, s * 5, a * 0.5);
        ctx.globalAlpha = a;
        star4(ctx, p.x, p.y, s);
      }
      blit(ctx, glow((t * 70) % 360, 100, 70), ox, oy, 220, 0.8);
      blit(ctx, glow(0, 0, 100), ox, oy, 60, 1);
      ctx.restore();
    },
  };
}

/* ---------- Гиперпрыжок ---------- */

function starWarp(): Effect {
  const stars = Array.from({ length: 240 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1), hue: rnd(190, 300) }));
  return {
    layer: 'back',
    draw(ctx, t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const speed = 0.35 + level * 1.2 + 0.1 * Math.sin(t * 0.5);
      ctx.save();
      // затемняем фон, чтобы звёзды читались на любом изображении
      ctx.fillStyle = 'rgba(5,0,20,0.35)';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (const s of stars) {
        s.z -= dt * speed;
        if (s.z <= 0.03) {
          s.x = rnd(-1, 1);
          s.y = rnd(-1, 1);
          s.z = 1;
          continue;
        }
        const tail = s.z + dt * speed * 5;
        const k = 420;
        const a = Math.min(1, (1 - s.z) * 1.4);
        ctx.globalAlpha = a;
        ctx.strokeStyle = `hsl(${s.hue},90%,75%)`;
        ctx.lineWidth = (1 - s.z) * 5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + (s.x / tail) * k, cy + (s.y / tail) * k);
        ctx.lineTo(cx + (s.x / s.z) * k, cy + (s.y / s.z) * k);
        ctx.stroke();
      }
      blit(ctx, glow(260, 100, 60), cx, cy, 500, 0.35 + level * 0.4);
      ctx.restore();
    },
  };
}

/* ---------- Воздушные шары ---------- */

function balloons(): Effect {
  const hues = [350, 25, 48, 140, 200, 270, 320];
  const make = (y?: number) => ({
    x: rnd(60, SIZE - 60),
    y: y ?? SIZE + rnd(80, 400),
    r: rnd(42, 78),
    v: rnd(70, 130),
    hue: hues[Math.floor(Math.random() * hues.length)],
    ph: rnd(0, 6.28),
  });
  const list = Array.from({ length: 13 }, () => make(rnd(0, SIZE + 300)));
  return {
    layer: 'back',
    draw(ctx, t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      ctx.save();
      for (const b of list) {
        b.y -= b.v * (1 + level * 0.8) * dt;
        const x = b.x + Math.sin(t * 0.9 + b.ph) * 22;
        if (b.y < -b.r * 4) Object.assign(b, make());
        const { r, hue } = b;
        // нитка
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, b.y + r * 1.12);
        const w = Math.sin(t * 2 + b.ph) * 14;
        ctx.bezierCurveTo(x + w, b.y + r * 1.7, x - w, b.y + r * 2.3, x + w * 0.5, b.y + r * 3);
        ctx.stroke();
        // узелок
        ctx.fillStyle = `hsl(${hue},80%,35%)`;
        ctx.beginPath();
        ctx.moveTo(x, b.y + r * 0.98);
        ctx.lineTo(x - r * 0.13, b.y + r * 1.14);
        ctx.lineTo(x + r * 0.13, b.y + r * 1.14);
        ctx.fill();
        // шар с бликом
        const g = ctx.createRadialGradient(x - r * 0.35, b.y - r * 0.4, r * 0.08, x, b.y, r * 1.1);
        g.addColorStop(0, `hsl(${hue},100%,88%)`);
        g.addColorStop(0.35, `hsl(${hue},85%,60%)`);
        g.addColorStop(1, `hsl(${hue},80%,32%)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, b.y, r * 0.86, r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}

/* ---------- Мыльные пузыри ---------- */

function bubbles(): Effect {
  const make = (y?: number) => ({ x: rnd(0, SIZE), y: y ?? SIZE + rnd(40, 300), r: rnd(18, 70), v: rnd(40, 95), ph: rnd(0, 6.28) });
  const list = Array.from({ length: 30 }, () => make(rnd(0, SIZE)));
  return {
    layer: 'front',
    draw(ctx, t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      ctx.save();
      for (const b of list) {
        b.y -= b.v * dt;
        b.x += Math.sin(t * 0.8 + b.ph) * 25 * dt;
        if (b.y < -b.r * 2) Object.assign(b, make());
        const r = b.r * (1 + level * 0.15 * Math.sin(t * 8 + b.ph));
        const hue = (t * 40 + b.ph * 60) % 360;
        // радужная плёнка: почти прозрачная середина, переливы к краю
        const g = ctx.createRadialGradient(b.x - r * 0.3, b.y - r * 0.3, r * 0.1, b.x, b.y, r);
        g.addColorStop(0, 'rgba(255,255,255,0.04)');
        g.addColorStop(0.75, `hsla(${hue},90%,75%,0.12)`);
        g.addColorStop(0.92, `hsla(${(hue + 120) % 360},90%,78%,0.4)`);
        g.addColorStop(1, `hsla(${(hue + 220) % 360},90%,85%,0.55)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // блик
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.ellipse(b.x - r * 0.38, b.y - r * 0.42, r * 0.18, r * 0.09, -0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}

/* ---------- Падающие звёзды ---------- */

function shootingStars(): Effect {
  const stars = Array.from({ length: 90 }, () => ({ x: rnd(0, SIZE), y: rnd(0, SIZE * 0.75), s: rnd(1, 2.6), ph: rnd(0, 6.28), sp: rnd(1, 3) }));
  const meteors: { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number }[] = [];
  let timer = 0.4;
  let prev = 0;
  const spawn = () => {
    const a = rnd(2.25, 2.6); // вниз-влево
    const sp = rnd(900, 1300);
    meteors.push({ x: rnd(SIZE * 0.3, SIZE * 1.1), y: rnd(-60, SIZE * 0.35), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rnd(0.8, 1.3), len: rnd(180, 320) });
  };
  return {
    layer: 'back',
    draw(ctx, t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      timer -= dt;
      if (timer <= 0 || (level - prev > 0.12 && meteors.length < 4)) {
        spawn();
        timer = rnd(0.7, 1.6);
      }
      prev = level;
      ctx.save();
      ctx.fillStyle = 'rgba(5,5,30,0.3)'; // «ночь» — звёзды видны на любом фоне
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'lighter';
      for (const s of stars) blit(ctx, glow(220, 60, 85), s.x, s.y, s.s * 8, 0.3 + 0.6 * Math.abs(Math.sin(t * s.sp + s.ph)));
      ctx.lineCap = 'round';
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt;
        if (m.life > m.max) {
          meteors.splice(i, 1);
          continue;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const k = Math.hypot(m.vx, m.vy);
        const tx = m.x - (m.vx / k) * m.len;
        const ty = m.y - (m.vy / k) * m.len;
        const a = Math.sin((m.life / m.max) * Math.PI); // плавно вспыхивает и гаснет
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(0.3, `rgba(170,200,255,${a * 0.6})`);
        g.addColorStop(1, 'rgba(120,150,255,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        blit(ctx, glow(210, 80, 85), m.x, m.y, 60, a);
      }
      ctx.restore();
    },
  };
}

/* ---------- Небесные фонарики ---------- */

function lanterns(): Effect {
  const make = (y?: number) => {
    const z = rnd(0.35, 1); // глубина: дальние — меньше и медленнее
    return { x: rnd(40, SIZE - 40), y: y ?? SIZE + rnd(60, 300), z, v: 18 + 40 * z, ph: rnd(0, 6.28) };
  };
  const list = Array.from({ length: 18 }, () => make(rnd(0, SIZE)));
  return {
    layer: 'back',
    draw(ctx, t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      ctx.save();
      for (const l of [...list].sort((a, b) => a.z - b.z)) {
        l.y -= l.v * dt;
        if (l.y < -120) Object.assign(l, make());
        const x = l.x + Math.sin(t * 0.5 + l.ph) * 18 * l.z;
        const s = 26 + 50 * l.z;
        const flick = 0.75 + 0.25 * Math.sin(t * 9 + l.ph) * Math.sin(t * 5.3 + l.ph * 2) + level * 0.3;
        ctx.globalCompositeOperation = 'lighter';
        blit(ctx, glow(32, 100, 60), x, l.y + s * 0.2, s * 5, 0.45 * flick * l.z);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.6 + 0.4 * l.z;
        const g = ctx.createLinearGradient(0, l.y - s * 0.5, 0, l.y + s * 0.5);
        g.addColorStop(0, 'hsl(18,95%,55%)');
        g.addColorStop(1, 'hsl(45,100%,78%)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.36, l.y - s * 0.5);
        ctx.lineTo(x + s * 0.36, l.y - s * 0.5);
        ctx.lineTo(x + s * 0.26, l.y + s * 0.5);
        ctx.lineTo(x - s * 0.26, l.y + s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(255,250,210,${0.8 * flick})`; // огонёк внутри
        ctx.beginPath();
        ctx.ellipse(x, l.y + s * 0.38, s * 0.12, s * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}

/* ---------- Диско ---------- */

function disco(): Effect {
  const spots = Array.from({ length: 7 }, (_, i) => ({ hue: i * 51, ph: rnd(0, 6.28), sp: rnd(0.4, 0.9) }));
  return {
    layer: 'back',
    draw(ctx, t, _dt, level) {
      const cx = SIZE / 2;
      const cy = 110;
      const R = 70;
      ctx.save();
      ctx.fillStyle = 'rgba(10,0,25,0.35)';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'lighter';
      // лучи от зеркального шара
      const n = 10;
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + Math.sin(t * 0.6 + i * 1.7) * 1.1;
        const w = 0.05 + 0.02 * Math.sin(t + i);
        const hue = (i * 36 + t * 40) % 360;
        const L = 1400;
        const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * L, cy + Math.sin(a) * L);
        g.addColorStop(0, `hsla(${hue},100%,65%,${0.32 + level * 0.35})`);
        g.addColorStop(1, `hsla(${hue},100%,60%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a - w) * L, cy + Math.sin(a - w) * L);
        ctx.lineTo(cx + Math.cos(a + w) * L, cy + Math.sin(a + w) * L);
        ctx.closePath();
        ctx.fill();
      }
      // световые пятна, бегающие по «полу»
      for (const s of spots) {
        const x = SIZE / 2 + Math.sin(t * s.sp + s.ph) * SIZE * 0.42;
        const y = SIZE * 0.78 + Math.cos(t * s.sp * 1.3 + s.ph) * 120;
        blit(ctx, glow((s.hue + t * 50) % 360, 100, 60), x, y, 220, 0.35 + level * 0.3);
      }
      ctx.globalCompositeOperation = 'source-over';
      // шар: подвес, тело, мерцающие зеркальные плитки
      ctx.strokeStyle = 'rgba(200,200,220,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cy - R);
      ctx.stroke();
      const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 5, cx, cy, R);
      body.addColorStop(0, '#f8fafc');
      body.addColorStop(1, '#475569');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.clip();
      const tile = 14;
      for (let y = cy - R; y < cy + R; y += tile)
        for (let x = cx - R; x < cx + R; x += tile) {
          const k = Math.sin(t * 6 + x * 0.3 + y * 0.17);
          if (k > 0.6) {
            ctx.fillStyle = `rgba(255,255,255,${(k - 0.6) * 2.2})`;
            ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
          }
        }
      ctx.restore();
      ctx.restore();
    },
  };
}

/* ---------- Бабочки ---------- */

function butterflies(): Effect {
  const list = Array.from({ length: 10 }, () => ({
    x: rnd(80, SIZE - 80),
    y: rnd(80, SIZE - 80),
    dir: rnd(0, 6.28),
    sp: rnd(70, 130),
    s: rnd(36, 60),
    hue: [330, 280, 200, 45, 15, 170][Math.floor(Math.random() * 6)],
    ph: rnd(0, 6.28),
  }));
  const wing = (ctx: CanvasRenderingContext2D, s: number, side: 1 | -1) => {
    ctx.beginPath(); // верхнее крыло
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(side * s * 1.3, -s * 1.5, side * s * 1.6, -s * 0.1, side * s * 0.1, s * 0.15);
    ctx.fill();
    ctx.beginPath(); // нижнее крыло
    ctx.moveTo(0, s * 0.1);
    ctx.bezierCurveTo(side * s * 1.1, s * 0.3, side * s * 0.8, s * 1.2, 0, s * 0.5);
    ctx.fill();
  };
  return {
    layer: 'front',
    draw(ctx, t, dtRaw, level) {
      const dt = Math.min(dtRaw, 0.05);
      ctx.save();
      for (const b of list) {
        b.dir += Math.sin(t * 0.7 + b.ph) * dt * 1.6;
        b.x += Math.cos(b.dir) * b.sp * dt;
        b.y += Math.sin(b.dir) * b.sp * dt;
        // держимся в кадре: у края разворачиваемся
        if (b.x < 40 || b.x > SIZE - 40 || b.y < 40 || b.y > SIZE - 40) b.dir = Math.atan2(SIZE / 2 - b.y, SIZE / 2 - b.x) + rnd(-0.5, 0.5);
        const flap = 0.2 + 0.8 * Math.abs(Math.sin(t * (9 + level * 6) + b.ph));
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.dir + Math.PI / 2);
        const g = ctx.createLinearGradient(-b.s, -b.s, b.s, b.s);
        g.addColorStop(0, `hsl(${b.hue},90%,65%)`);
        g.addColorStop(1, `hsl(${(b.hue + 40) % 360},90%,55%)`);
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.92;
        ctx.save();
        ctx.scale(flap, 1); // взмах крыльев
        wing(ctx, b.s, -1);
        wing(ctx, b.s, 1);
        ctx.restore();
        ctx.fillStyle = '#2b1a12';
        ctx.beginPath();
        ctx.ellipse(0, b.s * 0.15, b.s * 0.08, b.s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    },
  };
}

const FACTORIES: Record<Exclude<FxId, 'none'>, () => Effect> = {
  fireworks,
  aurora,
  lightLeaks,
  lensFlare,
  goldDust,
  magic,
  starWarp,
  balloons,
  bubbles,
  shootingStars,
  lanterns,
  disco,
  butterflies,
};

export function createEffect(id: FxId): Effect | null {
  return id === 'none' ? null : FACTORIES[id]();
}

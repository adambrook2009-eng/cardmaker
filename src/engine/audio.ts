import type { MusicChoice } from '../types';
import { getTrack, type ChordStyle, type InstrumentId, type Track } from '../data/music';

/* ---------- AudioContext (один на приложение) ---------- */

let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  // Браузеры «будят» звук только после нажатия — вызываем из обработчика клика
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  return getAudioContext().decodeAudioData(await file.arrayBuffer());
}

/* ---------- Ноты ---------- */

const SEMI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

function parseNote(s: string): { midi: number; minor: boolean } | null {
  const m = /^([A-G])([#b]?)(m?)(\d)$/.exec(s);
  if (!m) return null;
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return { midi: (+m[4] + 1) * 12 + SEMI[m[1]] + acc, minor: m[3] === 'm' };
}

function tokens(seq: string) {
  return seq
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [name, d] = tok.split('/');
      return { name, beats: d ? parseFloat(d) : 1 };
    });
}

/* ---------- Компиляция трека в список событий ---------- */

type Voice = InstrumentId | 'kick' | 'hat';
interface Ev {
  t: number; // в долях
  d: number;
  f: number;
  v: Voice;
}

function chordEvents(style: ChordStyle, voice: InstrumentId, root: number, minor: boolean, t0: number, len: number): Ev[] {
  const third = root + (minor ? 3 : 4);
  const fifth = root + 7;
  const out: Ev[] = [];
  if (style === 'pad') for (const n of [root, third, fifth]) out.push({ t: t0, d: len, f: freq(n + 12), v: voice });
  if (style === 'hold') out.push({ t: t0, d: len, f: freq(root), v: voice });
  if (style === 'pulse') for (let b = 0; b < len; b++) out.push({ t: t0 + b, d: 1, f: freq(b % 2 ? fifth - 12 : root), v: voice });
  if (style === 'arp') {
    const cycle = [root, third, fifth, root + 12, fifth, third];
    for (let i = 0; i < len * 2; i++) out.push({ t: t0 + i / 2, d: 0.5, f: freq(cycle[i % cycle.length] + 12), v: voice });
  }
  return out;
}

const compiled = new Map<string, { events: Ev[]; loopBeats: number }>();

function compile(track: Track) {
  const hit = compiled.get(track.id);
  if (hit) return hit;
  const events: Ev[] = [];
  let t = 0;
  for (const { name, beats } of tokens(track.melody)) {
    const n = parseNote(name);
    if (n) events.push({ t, d: beats, f: freq(n.midi), v: track.lead });
    t += beats;
  }
  const loopBeats = t;

  if (track.chords) {
    let ct = 0;
    for (const { name, beats } of tokens(track.chords)) {
      const n = parseNote(name);
      if (n) events.push(...chordEvents(track.style ?? 'hold', track.harmony ?? 'bass', n.midi, n.minor, ct, beats));
      ct += beats;
    }
  }
  if (track.drums) {
    for (let b = 0; b < loopBeats; b += 0.5) {
      if (b % 2 === 0) events.push({ t: b, d: 0.25, f: 0, v: 'kick' });
      events.push({ t: b, d: 0.1, f: 0, v: 'hat' });
    }
  }
  events.sort((a, b) => a.t - b.t);
  const res = { events, loopBeats };
  compiled.set(track.id, res);
  return res;
}

/* ---------- Синтезатор ---------- */

interface Instrument {
  wave: OscillatorType;
  gain: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  legato: number;
}

const INSTRUMENTS: Record<InstrumentId, Instrument> = {
  musicBox: { wave: 'triangle', gain: 0.32, attack: 0.005, decay: 0.25, sustain: 0.25, release: 0.25, legato: 1 },
  lead: { wave: 'square', gain: 0.1, attack: 0.01, decay: 0.12, sustain: 0.55, release: 0.04, legato: 0.8 },
  soft: { wave: 'triangle', gain: 0.18, attack: 0.03, decay: 0.4, sustain: 0.45, release: 0.35, legato: 1 },
  bell: { wave: 'sine', gain: 0.28, attack: 0.01, decay: 0.9, sustain: 0.2, release: 1.2, legato: 1 },
  pad: { wave: 'sine', gain: 0.07, attack: 0.8, decay: 1, sustain: 0.9, release: 1, legato: 1 },
  bass: { wave: 'triangle', gain: 0.3, attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.08, legato: 0.85 },
};

let noise: AudioBuffer | null = null;
function noiseBuffer(ac: BaseAudioContext) {
  if (!noise || noise.sampleRate !== ac.sampleRate) {
    noise = ac.createBuffer(1, ac.sampleRate * 0.1, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noise;
}

function playEvent(ac: BaseAudioContext, out: AudioNode, ev: Ev, t: number, dur: number) {
  if (ev.v === 'kick') {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.25);
    return;
  }
  if (ev.v === 'hat') {
    const s = ac.createBufferSource();
    s.buffer = noiseBuffer(ac);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s.connect(hp).connect(g).connect(out);
    s.start(t);
    s.stop(t + 0.06);
    return;
  }
  const p = INSTRUMENTS[ev.v];
  const o = ac.createOscillator();
  o.type = p.wave;
  o.frequency.value = ev.f;
  const g = ac.createGain();
  const end = t + dur * p.legato;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(p.gain, t + p.attack);
  g.gain.setTargetAtTime(p.gain * p.sustain, t + p.attack, p.decay / 3);
  g.gain.setTargetAtTime(0, end, p.release / 3);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(end + p.release * 2);
}

/* ---------- Воспроизведение ---------- */

export interface MusicOptions {
  /** Если задано — музыка плавно затихает к этой секунде (для видео). */
  duration?: number;
  volume?: number;
}

/**
 * Запускает музыку в указанный узел (динамики или поток записи видео).
 * Возвращает управление: остановка и текущая громкость (для эффектов «в такт»).
 */
export interface MusicHandle {
  stop(): void;
  /** Сглаженная громкость 0…1. */
  level(): number;
}

export function startMusic(choice: MusicChoice, ac: AudioContext, dest: AudioNode, opts: MusicOptions = {}): MusicHandle {
  if (choice.kind === 'none') return { stop: () => {}, level: () => 0 };
  const start = ac.currentTime + 0.05;
  const vol = opts.volume ?? 0.9;

  // Общий канал: громкость + мягкий фильтр (убирает резкость «квадратной» волны)
  const master = ac.createGain();
  master.gain.setValueAtTime(vol, start);
  if (opts.duration) {
    master.gain.setValueAtTime(vol, start + Math.max(0, opts.duration - 0.8));
    master.gain.linearRampToValueAtTime(0, start + opts.duration);
  }
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 4500;
  master.connect(lp).connect(dest);

  // «Ухо» для визуальных эффектов
  const analyser = ac.createAnalyser();
  analyser.fftSize = 1024;
  master.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  let smooth = 0;
  const level = () => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const v = Math.min(1, Math.sqrt(sum / buf.length) * 4);
    // быстрая атака, плавный спад — как стрелка индикатора
    smooth = v > smooth ? v : smooth * 0.9 + v * 0.1;
    return smooth;
  };

  let timer = 0;
  let src: AudioBufferSourceNode | null = null;

  if (choice.kind === 'file') {
    src = ac.createBufferSource();
    src.buffer = choice.buffer;
    const offset = (choice.offset ?? 0) % choice.buffer.duration;
    src.loop = true;
    // если видео длиннее оставшейся части песни — повторяем выбранный фрагмент, а не начало
    src.loopStart = offset;
    src.loopEnd = choice.buffer.duration;
    src.connect(master);
    src.start(start, offset);
  } else {
    // Классический «планировщик с упреждением»: ноты ставятся в очередь на 0.25 c вперёд
    const track = getTrack(choice.id);
    const { events, loopBeats } = compile(track);
    const spb = 60 / track.bpm;
    let loop = 0;
    let i = 0;
    const tick = () => {
      const horizon = ac.currentTime + 0.25;
      for (;;) {
        const ev = events[i];
        const at = start + (loop * loopBeats + ev.t) * spb;
        if (at > horizon) break;
        if (at >= ac.currentTime - 0.02) playEvent(ac, master, ev, at, ev.d * spb);
        if (++i >= events.length) {
          i = 0;
          loop++;
        }
      }
    };
    tick();
    timer = window.setInterval(tick, 60);
  }

  const stop = () => {
    clearInterval(timer);
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.15);
    setTimeout(() => {
      try {
        src?.stop();
      } catch {
        /* уже остановлен */
      }
      lp.disconnect();
      analyser.disconnect();
    }, 200);
  };
  return { stop, level };
}

/* ---------- Плеер превью (один на приложение) ---------- */

let preview: MusicHandle | null = null;
let playing = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const musicPlayer = {
  play(choice: MusicChoice) {
    preview?.stop();
    preview = null;
    playing = choice.kind !== 'none';
    if (playing) {
      const ac = getAudioContext();
      preview = startMusic(choice, ac, ac.destination);
    }
    emit();
  },
  stop() {
    preview?.stop();
    preview = null;
    playing = false;
    emit();
  },
  isPlaying: () => playing,
  level: () => (preview ? preview.level() : 0),
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  },
};

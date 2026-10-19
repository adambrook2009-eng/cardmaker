import type { TrackId } from './data/music';

export type Lang = 'ru' | 'he' | 'en';

export type CategoryId = 'congrats' | 'wishes' | 'sympathy' | 'funny' | 'kind' | 'love';
export type FilterId = 'none' | 'retro' | 'bright' | 'bw' | 'soft';
export type FrameId = 'none' | 'classic' | 'gold' | 'polaroid' | 'hearts' | 'flowers' | 'sparkles' | 'party';
export type AnimId = 'none' | 'snow' | 'petals' | 'lights' | 'sparkles' | 'hearts' | 'confetti' | 'bokeh';
export type TextAnimId = 'none' | 'pulse' | 'bounce' | 'typewriter' | 'glow';
export type FontId = 'rubik' | 'amatic' | 'caveat' | 'playfair';

/* ---- Спецэффекты ---- */
export type FxId = 'none' | 'fireworks' | 'aurora' | 'lightLeaks' | 'lensFlare' | 'goldDust' | 'magic' | 'starWarp';
/** Кино-обработка (WebGL пост-эффекты). */
export type LookId = 'none' | 'glow' | 'cinema' | 'dream' | 'neon' | 'vintage';
export type CameraId = 'none' | 'zoomIn' | 'zoomOut' | 'pan' | 'float';
export type IntroId = 'none' | 'fade' | 'flash' | 'iris' | 'curtain';
export type TextStyleId = 'plain' | 'gold' | 'neon' | 'extrude';

export type Background =
  | { kind: 'builtin'; id: string }
  /** Фото пользователя, заранее уменьшенное до разумного размера (быстро на телефонах). */
  | { kind: 'photo'; img: HTMLCanvasElement };

export type MusicChoice =
  | { kind: 'none' }
  | { kind: 'builtin'; id: TrackId }
  | {
      kind: 'file';
      name: string;
      buffer: AudioBuffer;
      /** С какой секунды играть (например, с припева). */
      offset?: number;
      /** Песня из Jamendo: id, подпись «Название — Исполнитель» и лицензия CC. */
      songId?: string;
      credit?: string;
      license?: string;
    };

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export interface CardText {
  value: string;
  x: number;
  y: number;
  color: string;
  font: FontId;
  size: number;
  anim: TextAnimId;
  style: TextStyleId;
}

export interface CardState {
  category: CategoryId;
  background: Background;
  filter: FilterId;
  frame: FrameId;
  animation: AnimId;
  music: MusicChoice;
  fx: FxId;
  look: LookId;
  camera: CameraId;
  intro: IntroId;
  stickers: Sticker[];
  text: CardText;
}

/** Что сейчас выделено на холсте (для перетаскивания). */
export type Selection = { type: 'sticker'; id: string } | { type: 'text' } | null;

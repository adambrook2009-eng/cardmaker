import type { TrackId } from './data/music';

export type Lang = 'ru' | 'he' | 'en';

export type CategoryId = 'congrats' | 'wishes' | 'sympathy' | 'funny' | 'kind' | 'love';
export type FilterId =
  | 'none'
  | 'bright'
  | 'warm'
  | 'cool'
  | 'sunset'
  | 'golden'
  | 'retro'
  | 'film'
  | 'fade'
  | 'pastel'
  | 'soft'
  | 'dramatic'
  | 'lomo'
  | 'bw'
  | 'noir'
  | 'sepia'
  | 'arctic'
  | 'cyber'
  | 'duoPink'
  | 'duoBlue'
  | 'invert';

/** «Игра с цветом»: ручные настройки поверх любого фильтра. 100 / 0 — без изменений. */
export interface ColorAdjust {
  brightness: number; // 50…150 %
  contrast: number; // 50…150 %
  saturate: number; // 0…200 %
  hue: number; // -180…180 °
  warmth: number; // -100…100: холоднее ↔ теплее
  fade: number; // 0…100: «матовое» выцветание
  vignette: number; // 0…100: затемнение по краям
}

export const NEUTRAL_ADJUST: ColorAdjust = { brightness: 100, contrast: 100, saturate: 100, hue: 0, warmth: 0, fade: 0, vignette: 0 };
export type FrameId = 'none' | 'classic' | 'gold' | 'polaroid' | 'hearts' | 'flowers' | 'sparkles' | 'party';
export type AnimId =
  | 'none'
  | 'snow'
  | 'petals'
  | 'lights'
  | 'sparkles'
  | 'hearts'
  | 'confetti'
  | 'bokeh'
  | 'stars'
  | 'coins'
  | 'leaves'
  | 'fireflies'
  | 'notes'
  | 'ribbons'
  | 'emojiRain'
  | 'rings'
  | 'rain';
export type TextAnimId = 'none' | 'pulse' | 'bounce' | 'typewriter' | 'glow';
export type FontId = 'rubik' | 'amatic' | 'caveat' | 'playfair';

/* ---- Спецэффекты ---- */
export type FxId =
  | 'none'
  | 'fireworks'
  | 'aurora'
  | 'lightLeaks'
  | 'lensFlare'
  | 'goldDust'
  | 'magic'
  | 'starWarp'
  | 'balloons'
  | 'bubbles'
  | 'shootingStars'
  | 'lanterns'
  | 'disco'
  | 'butterflies';
/** Кино-обработка (WebGL пост-эффекты). */
export type LookId = 'none' | 'glow' | 'cinema' | 'dream' | 'neon' | 'vintage';
export type CameraId = 'none' | 'zoomIn' | 'zoomOut' | 'pan' | 'float';
export type IntroId = 'none' | 'fade' | 'flash' | 'iris' | 'curtain';
export type TextStyleId = 'plain' | 'gold' | 'neon' | 'extrude';

export type Background =
  | { kind: 'builtin'; id: string }
  /**
   * Свои фото — одно или слайд-шоу. Каждое заранее уменьшено (быстро на телефонах).
   * slideSec — сколько секунд показывать каждое фото, transition — как сменяются.
   */
  | { kind: 'photos'; imgs: HTMLCanvasElement[]; slideSec: number; transition: SlideTransition }
  /** «Чистый экран»: один цвет или градиент из двух. */
  | { kind: 'color'; colors: string[] };

export type SlideTransition = 'fade' | 'slide' | 'zoom';

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
  adjust: ColorAdjust;
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

export type Lang = 'ru' | 'he' | 'en';

export type CategoryId = 'congrats' | 'wishes' | 'sympathy' | 'funny' | 'kind' | 'love';
export type FilterId = 'none' | 'retro' | 'bright' | 'bw' | 'soft';
export type FrameId = 'none' | 'classic' | 'gold' | 'polaroid' | 'hearts' | 'flowers' | 'sparkles' | 'party';
export type AnimId = 'none' | 'snow' | 'petals' | 'lights' | 'sparkles' | 'hearts' | 'confetti' | 'bokeh';
export type TextAnimId = 'none' | 'pulse' | 'bounce' | 'typewriter' | 'glow';
export type FontId = 'rubik' | 'amatic' | 'caveat' | 'playfair';

export type Background =
  | { kind: 'builtin'; id: string }
  /** Фото пользователя, заранее уменьшенное до разумного размера (быстро на телефонах). */
  | { kind: 'photo'; img: HTMLCanvasElement };

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
}

export interface CardState {
  category: CategoryId;
  background: Background;
  filter: FilterId;
  frame: FrameId;
  animation: AnimId;
  stickers: Sticker[];
  text: CardText;
}

/** Что сейчас выделено на холсте (для перетаскивания). */
export type Selection = { type: 'sticker'; id: string } | { type: 'text' } | null;

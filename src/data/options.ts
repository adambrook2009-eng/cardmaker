import type { AnimId, FilterId, FontId, FrameId, TextAnimId } from '../types';

export const FILTERS: { id: FilterId; css: string }[] = [
  { id: 'none', css: 'none' },
  { id: 'retro', css: 'sepia(0.55) contrast(1.1) saturate(1.25) hue-rotate(-8deg)' },
  { id: 'bright', css: 'saturate(1.7) brightness(1.08) contrast(1.05)' },
  { id: 'bw', css: 'grayscale(1) contrast(1.15)' },
  { id: 'soft', css: 'brightness(1.06) saturate(0.9)' },
];

export const FRAMES: FrameId[] = ['none', 'classic', 'gold', 'polaroid', 'hearts', 'flowers', 'sparkles', 'party'];

export const ANIMATIONS: { id: AnimId; icon: string }[] = [
  { id: 'none', icon: '⏹️' },
  { id: 'snow', icon: '❄️' },
  { id: 'petals', icon: '🌸' },
  { id: 'lights', icon: '💡' },
  { id: 'sparkles', icon: '✨' },
  { id: 'hearts', icon: '💓' },
  { id: 'confetti', icon: '🎊' },
  { id: 'bokeh', icon: '🫧' },
];

export const TEXT_ANIMS: { id: TextAnimId; icon: string }[] = [
  { id: 'none', icon: '—' },
  { id: 'pulse', icon: '💗' },
  { id: 'bounce', icon: '⤴️' },
  { id: 'typewriter', icon: '⌨️' },
  { id: 'glow', icon: '🔆' },
];

/** Все шрифты поддерживают кириллицу; Rubik и Amatic SC — ещё и иврит. */
export const FONTS: { id: FontId; family: string; label: string }[] = [
  { id: 'rubik', family: '"Rubik", "Arial Hebrew", Arial, sans-serif', label: 'Rubik' },
  { id: 'amatic', family: '"Amatic SC", "Rubik", cursive', label: 'Amatic' },
  { id: 'caveat', family: '"Caveat", "Rubik", cursive', label: 'Caveat' },
  { id: 'playfair', family: '"Playfair Display", "Rubik", Georgia, serif', label: 'Playfair' },
];

export const TEXT_COLORS = ['#ffffff', '#111827', '#fde047', '#f472b6', '#ef4444', '#22c55e', '#38bdf8', '#a78bfa'];

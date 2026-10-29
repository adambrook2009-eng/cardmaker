import type { AnimId, FilterId, FontId, FrameId, TextAnimId } from '../types';

/**
 * Фильтр = CSS-обработка фона + (по желанию) цветные наложения в режимах смешивания и виньетка.
 * Наложения работают и там, где браузер не умеет ctx.filter (старый Safari).
 */
export interface FilterDef {
  id: FilterId;
  css: string;
  tints?: { color: string; mode: GlobalCompositeOperation; alpha: number }[];
  vignette?: number;
}

export const FILTERS: FilterDef[] = [
  { id: 'none', css: 'none' },
  { id: 'bright', css: 'saturate(1.7) brightness(1.08) contrast(1.05)' },
  { id: 'warm', css: 'saturate(1.12) brightness(1.03)', tints: [{ color: '#ff9a3c', mode: 'soft-light', alpha: 0.4 }] },
  { id: 'cool', css: 'saturate(0.95) brightness(1.02)', tints: [{ color: '#3c8dff', mode: 'soft-light', alpha: 0.4 }] },
  { id: 'sunset', css: 'contrast(1.05) saturate(1.25)', tints: [{ color: '#ff5e62', mode: 'overlay', alpha: 0.22 }, { color: '#ffd166', mode: 'soft-light', alpha: 0.35 }] },
  { id: 'golden', css: 'sepia(0.3) saturate(1.4) brightness(1.04)', tints: [{ color: '#ffc247', mode: 'soft-light', alpha: 0.45 }] },
  { id: 'retro', css: 'sepia(0.55) contrast(1.1) saturate(1.25) hue-rotate(-8deg)', vignette: 0.55 },
  { id: 'film', css: 'contrast(1.12) saturate(0.88) sepia(0.15)', tints: [{ color: '#1f8a8a', mode: 'soft-light', alpha: 0.25 }], vignette: 0.3 },
  { id: 'fade', css: 'contrast(0.82) brightness(1.08) saturate(0.85)', tints: [{ color: '#f3e9dc', mode: 'lighten', alpha: 0.22 }] },
  { id: 'pastel', css: 'saturate(0.7) brightness(1.12) contrast(0.9)', tints: [{ color: '#ffc8e8', mode: 'soft-light', alpha: 0.35 }] },
  { id: 'soft', css: 'brightness(1.06) saturate(0.9)' },
  { id: 'dramatic', css: 'contrast(1.45) saturate(1.15) brightness(0.95)', vignette: 0.5 },
  { id: 'lomo', css: 'saturate(1.5) contrast(1.3)', vignette: 0.75 },
  { id: 'bw', css: 'grayscale(1) contrast(1.15)' },
  { id: 'noir', css: 'grayscale(1) contrast(1.6) brightness(0.9)', vignette: 0.6 },
  { id: 'sepia', css: 'sepia(0.9) contrast(1.05) brightness(1.02)' },
  { id: 'arctic', css: 'saturate(0.6) brightness(1.1)', tints: [{ color: '#9fd8ff', mode: 'soft-light', alpha: 0.5 }] },
  { id: 'cyber', css: 'hue-rotate(160deg) saturate(1.6) contrast(1.15)', tints: [{ color: '#ff00d4', mode: 'overlay', alpha: 0.18 }] },
  // дуотон: Ч/Б, а затем один цвет в режиме «цветность»
  { id: 'duoPink', css: 'grayscale(1) contrast(1.2)', tints: [{ color: '#ff3d9a', mode: 'color', alpha: 0.85 }] },
  { id: 'duoBlue', css: 'grayscale(1) contrast(1.2)', tints: [{ color: '#2f7bff', mode: 'color', alpha: 0.85 }] },
  { id: 'invert', css: 'invert(1) hue-rotate(180deg)' },
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
  { id: 'stars', icon: '⭐' },
  { id: 'coins', icon: '🪙' },
  { id: 'leaves', icon: '🍁' },
  { id: 'fireflies', icon: '🌟' },
  { id: 'notes', icon: '🎵' },
  { id: 'ribbons', icon: '🎀' },
  { id: 'emojiRain', icon: '🥳' },
  { id: 'rings', icon: '⭕' },
  { id: 'rain', icon: '🌧️' },
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

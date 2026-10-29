import type { AnimId, CameraId, FrameId, FxId, IntroId, LookId, TextStyleId } from '../types';

export const FX_LIST: { id: FxId; icon: string }[] = [
  { id: 'none', icon: '⏹️' },
  { id: 'fireworks', icon: '🎆' },
  { id: 'aurora', icon: '🌌' },
  { id: 'lensFlare', icon: '🔆' },
  { id: 'goldDust', icon: '💫' },
  { id: 'magic', icon: '🪄' },
  { id: 'starWarp', icon: '🚀' },
  { id: 'lightLeaks', icon: '🌅' },
  { id: 'balloons', icon: '🎈' },
  { id: 'bubbles', icon: '🫧' },
  { id: 'shootingStars', icon: '🌠' },
  { id: 'lanterns', icon: '🏮' },
  { id: 'disco', icon: '🪩' },
  { id: 'butterflies', icon: '🦋' },
];

export const LOOK_LIST: { id: LookId; icon: string }[] = [
  { id: 'none', icon: '⚪' },
  { id: 'glow', icon: '💡' },
  { id: 'cinema', icon: '🎬' },
  { id: 'dream', icon: '☁️' },
  { id: 'neon', icon: '🟣' },
  { id: 'vintage', icon: '📽️' },
];

export const CAMERA_LIST: { id: CameraId; icon: string }[] = [
  { id: 'none', icon: '⏹️' },
  { id: 'zoomIn', icon: '🔍' },
  { id: 'zoomOut', icon: '🔭' },
  { id: 'pan', icon: '↔️' },
  { id: 'float', icon: '🎈' },
];

export const INTRO_LIST: { id: IntroId; icon: string }[] = [
  { id: 'none', icon: '⏹️' },
  { id: 'fade', icon: '🌑' },
  { id: 'flash', icon: '⚡' },
  { id: 'iris', icon: '⭕' },
  { id: 'curtain', icon: '🎭' },
];

export const TEXT_STYLES: { id: TextStyleId; icon: string }[] = [
  { id: 'plain', icon: 'Aa' },
  { id: 'gold', icon: '🥇' },
  { id: 'neon', icon: '🌈' },
  { id: 'extrude', icon: '🧊' },
];

export type PresetId =
  | 'hollywood'
  | 'salute'
  | 'magic'
  | 'aurora'
  | 'neonParty'
  | 'gold'
  | 'retro'
  | 'balloonParty'
  | 'starryNight'
  | 'lanternFestival'
  | 'discoNight'
  | 'bubblesKids'
  | 'butterflyGarden';

/** Готовые стили «в один клик»: сразу эффект + обработка + камера + появление + стиль текста. */
export interface Preset {
  id: PresetId;
  icon: string;
  fx: FxId;
  look: LookId;
  camera: CameraId;
  intro: IntroId;
  textStyle: TextStyleId;
  animation?: AnimId;
  frame?: FrameId;
  /** Подходящий фон — подставляется, только если пользователь не загрузил своё фото. */
  background?: string;
}

export const PRESETS: Preset[] = [
  { id: 'hollywood', icon: '🎬', fx: 'lensFlare', look: 'cinema', camera: 'zoomIn', intro: 'fade', textStyle: 'gold', animation: 'none', frame: 'none' },
  { id: 'salute', icon: '🎆', fx: 'fireworks', look: 'glow', camera: 'float', intro: 'flash', textStyle: 'extrude', animation: 'none', background: 'night' },
  { id: 'magic', icon: '🪄', fx: 'magic', look: 'dream', camera: 'float', intro: 'iris', textStyle: 'gold', animation: 'sparkles' },
  { id: 'aurora', icon: '🌌', fx: 'aurora', look: 'glow', camera: 'pan', intro: 'fade', textStyle: 'neon', animation: 'snow', frame: 'none', background: 'night' },
  { id: 'neonParty', icon: '🪩', fx: 'starWarp', look: 'neon', camera: 'float', intro: 'flash', textStyle: 'neon', animation: 'none', frame: 'none', background: 'night' },
  { id: 'gold', icon: '💛', fx: 'goldDust', look: 'glow', camera: 'zoomIn', intro: 'curtain', textStyle: 'gold', animation: 'none', frame: 'gold' },
  { id: 'retro', icon: '📽️', fx: 'lightLeaks', look: 'vintage', camera: 'pan', intro: 'fade', textStyle: 'plain', animation: 'none', frame: 'polaroid' },
  { id: 'balloonParty', icon: '🎈', fx: 'balloons', look: 'glow', camera: 'float', intro: 'flash', textStyle: 'extrude', animation: 'confetti', frame: 'none', background: 'sunset' },
  { id: 'starryNight', icon: '🌠', fx: 'shootingStars', look: 'dream', camera: 'zoomIn', intro: 'fade', textStyle: 'neon', animation: 'none', frame: 'none', background: 'night' },
  { id: 'lanternFestival', icon: '🏮', fx: 'lanterns', look: 'glow', camera: 'pan', intro: 'fade', textStyle: 'gold', animation: 'none', frame: 'none', background: 'night' },
  { id: 'discoNight', icon: '🪩', fx: 'disco', look: 'neon', camera: 'float', intro: 'flash', textStyle: 'neon', animation: 'none', frame: 'none', background: 'party' },
  { id: 'bubblesKids', icon: '🫧', fx: 'bubbles', look: 'dream', camera: 'float', intro: 'iris', textStyle: 'extrude', animation: 'none', frame: 'none', background: 'ocean' },
  { id: 'butterflyGarden', icon: '🦋', fx: 'butterflies', look: 'none', camera: 'pan', intro: 'fade', textStyle: 'gold', animation: 'petals', frame: 'flowers', background: 'meadow' },
];

/** Палитра «Чистого экрана». */
export const CLEAN_COLORS = [
  '#ffffff', '#f4ebdd', '#fde2e4', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff',
  '#a0c4ff', '#bdb2ff', '#e11d48', '#7f1d1d', '#14532d', '#1e293b', '#000000',
];

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

export type PresetId = 'hollywood' | 'salute' | 'magic' | 'aurora' | 'neonParty' | 'gold' | 'retro';

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
];

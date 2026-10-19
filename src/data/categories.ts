import type { AnimId, CameraId, CategoryId, FrameId, FxId, IntroId, LookId, TextAnimId, TextStyleId } from '../types';
import type { TrackId } from './music';

export interface Category {
  id: CategoryId;
  icon: string;
  color: string;
  /** Что подставляется автоматически при выборе категории — карточка сразу выглядит готовой. */
  defaults: {
    background: string;
    animation: AnimId;
    frame: FrameId;
    textColor: string;
    textAnim: TextAnimId;
    stickerPack: string;
    music: TrackId;
    fx: FxId;
    look: LookId;
    camera: CameraId;
    intro: IntroId;
    textStyle: TextStyleId;
  };
}

export const CATEGORIES: Category[] = [
  {
    id: 'congrats',
    icon: '🎉',
    color: '#f59e0b',
    defaults: { background: 'party', animation: 'confetti', frame: 'party', textColor: '#ffffff', textAnim: 'bounce', stickerPack: 'party', music: 'birthday', fx: 'fireworks', look: 'glow', camera: 'float', intro: 'flash', textStyle: 'extrude' },
  },
  {
    id: 'wishes',
    icon: '🌟',
    color: '#06b6d4',
    defaults: { background: 'sunset', animation: 'sparkles', frame: 'none', textColor: '#ffffff', textAnim: 'glow', stickerPack: 'sparkles', music: 'party', fx: 'lensFlare', look: 'cinema', camera: 'zoomIn', intro: 'fade', textStyle: 'gold' },
  },
  {
    id: 'sympathy',
    icon: '🕊️',
    color: '#64748b',
    defaults: { background: 'calm', animation: 'bokeh', frame: 'gold', textColor: '#ffffff', textAnim: 'none', stickerPack: 'flowers', music: 'calm', fx: 'goldDust', look: 'dream', camera: 'zoomIn', intro: 'fade', textStyle: 'plain' },
  },
  {
    id: 'funny',
    icon: '😂',
    color: '#eab308',
    defaults: { background: 'pop', animation: 'none', frame: 'none', textColor: '#ffffff', textAnim: 'pulse', stickerPack: 'faces', music: 'funny', fx: 'none', look: 'none', camera: 'none', intro: 'flash', textStyle: 'extrude' },
  },
  {
    id: 'kind',
    icon: '🐱',
    color: '#22c55e',
    defaults: { background: 'meadow', animation: 'petals', frame: 'flowers', textColor: '#ffffff', textAnim: 'none', stickerPack: 'animals', music: 'twinkle', fx: 'lightLeaks', look: 'dream', camera: 'pan', intro: 'fade', textStyle: 'plain' },
  },
  {
    id: 'love',
    icon: '💖',
    color: '#ec4899',
    defaults: { background: 'love', animation: 'hearts', frame: 'hearts', textColor: '#ffffff', textAnim: 'pulse', stickerPack: 'hearts', music: 'romantic', fx: 'magic', look: 'dream', camera: 'float', intro: 'iris', textStyle: 'plain' },
  },
];

export const getCategory = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

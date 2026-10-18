import type { AnimId, CategoryId, FrameId, TextAnimId } from '../types';

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
  };
}

export const CATEGORIES: Category[] = [
  {
    id: 'congrats',
    icon: '🎉',
    color: '#f59e0b',
    defaults: { background: 'party', animation: 'confetti', frame: 'party', textColor: '#ffffff', textAnim: 'bounce', stickerPack: 'party' },
  },
  {
    id: 'wishes',
    icon: '🌟',
    color: '#06b6d4',
    defaults: { background: 'sunset', animation: 'sparkles', frame: 'classic', textColor: '#ffffff', textAnim: 'glow', stickerPack: 'sparkles' },
  },
  {
    id: 'sympathy',
    icon: '🕊️',
    color: '#64748b',
    defaults: { background: 'calm', animation: 'bokeh', frame: 'gold', textColor: '#ffffff', textAnim: 'none', stickerPack: 'flowers' },
  },
  {
    id: 'funny',
    icon: '😂',
    color: '#eab308',
    defaults: { background: 'pop', animation: 'none', frame: 'none', textColor: '#ffffff', textAnim: 'pulse', stickerPack: 'faces' },
  },
  {
    id: 'kind',
    icon: '🐱',
    color: '#22c55e',
    defaults: { background: 'meadow', animation: 'petals', frame: 'flowers', textColor: '#ffffff', textAnim: 'none', stickerPack: 'animals' },
  },
  {
    id: 'love',
    icon: '💖',
    color: '#ec4899',
    defaults: { background: 'love', animation: 'hearts', frame: 'hearts', textColor: '#ffffff', textAnim: 'pulse', stickerPack: 'hearts' },
  },
];

export const getCategory = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

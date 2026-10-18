/** Стикеры — эмодзи: ноль файлов, работают офлайн, масштабируются без потерь. */
export interface StickerPack {
  id: string;
  icon: string;
  items: string[];
}

export const STICKER_PACKS: StickerPack[] = [
  { id: 'hearts', icon: '❤️', items: ['❤️', '💖', '💕', '💘', '💝', '💗', '😍', '🥰', '💌', '💋'] },
  { id: 'flowers', icon: '🌸', items: ['🌸', '🌹', '🌷', '🌻', '🌼', '💐', '🌺', '🍀', '🕊️', '🕯️'] },
  { id: 'sparkles', icon: '✨', items: ['✨', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '💎', '🔥', '🏆'] },
  { id: 'party', icon: '🥳', items: ['🥳', '🎉', '🎂', '🎈', '🎁', '🎊', '🍾', '🥂', '🧁', '🎄'] },
  { id: 'animals', icon: '🐱', items: ['🐱', '😺', '🐶', '🐰', '🦊', '🐻', '🐼', '🦋', '🐝', '🦄'] },
  { id: 'faces', icon: '😂', items: ['😂', '🤣', '😎', '🤪', '😜', '🙃', '🤡', '👻', '🤓', '😴'] },
];

export const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

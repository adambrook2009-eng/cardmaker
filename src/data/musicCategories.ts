import type { CategoryId, Lang } from '../types';

/**
 * Категории музыки для поиска в интернете. tags — английские теги, по которым ищем
 * (в свободных каталогах музыка подписана по-английски). tags: '' — «песни на языке интерфейса».
 */
export interface MusicCategory {
  id: string;
  icon: string;
  tags: string;
  label: Record<Lang, string>;
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  { id: 'native', icon: '🎤', tags: '', label: { ru: 'На русском', he: 'בעברית', en: '' } },
  { id: 'birthday', icon: '🎂', tags: 'birthday', label: { ru: 'День рождения', he: 'יום הולדת', en: 'Birthday' } },
  { id: 'love', icon: '❤️', tags: 'love', label: { ru: 'Любовь', he: 'אהבה', en: 'Love' } },
  { id: 'romantic', icon: '🌹', tags: 'romantic', label: { ru: 'Романтика', he: 'רומנטי', en: 'Romantic' } },
  { id: 'wedding', icon: '💍', tags: 'wedding', label: { ru: 'Свадьба', he: 'חתונה', en: 'Wedding' } },
  { id: 'party', icon: '🎉', tags: 'party', label: { ru: 'Вечеринка', he: 'מסיבה', en: 'Party' } },
  { id: 'dance', icon: '💃', tags: 'dance', label: { ru: 'Танцевальная', he: 'ריקודים', en: 'Dance' } },
  { id: 'happy', icon: '😊', tags: 'happy', label: { ru: 'Весёлая', he: 'שמחה', en: 'Happy' } },
  { id: 'christmas', icon: '🎄', tags: 'christmas', label: { ru: 'Новый год', he: 'חג', en: 'Holidays' } },
  { id: 'kids', icon: '🧸', tags: 'children', label: { ru: 'Детская', he: 'לילדים', en: 'Kids' } },
  { id: 'lullaby', icon: '🌙', tags: 'lullaby', label: { ru: 'Колыбельная', he: 'שיר ערש', en: 'Lullaby' } },
  { id: 'calm', icon: '🕊️', tags: 'calm', label: { ru: 'Спокойная', he: 'רגועה', en: 'Calm' } },
  { id: 'sad', icon: '🌧️', tags: 'sad', label: { ru: 'Грустная', he: 'עצובה', en: 'Sad' } },
  { id: 'funny', icon: '🤪', tags: 'funny', label: { ru: 'Смешная', he: 'מצחיקה', en: 'Funny' } },
  { id: 'pop', icon: '🎙️', tags: 'pop', label: { ru: 'Поп', he: 'פופ', en: 'Pop' } },
  { id: 'rock', icon: '🎸', tags: 'rock', label: { ru: 'Рок', he: 'רוק', en: 'Rock' } },
  { id: 'jazz', icon: '🎷', tags: 'jazz', label: { ru: 'Джаз', he: 'ג׳אז', en: 'Jazz' } },
  { id: 'classical', icon: '🎻', tags: 'classical', label: { ru: 'Классика', he: 'קלאסית', en: 'Classical' } },
  { id: 'piano', icon: '🎹', tags: 'piano', label: { ru: 'Пианино', he: 'פסנתר', en: 'Piano' } },
  { id: 'acoustic', icon: '🪕', tags: 'acoustic', label: { ru: 'Акустика', he: 'אקוסטי', en: 'Acoustic' } },
  { id: 'electronic', icon: '🎛️', tags: 'electronic', label: { ru: 'Электронная', he: 'אלקטרונית', en: 'Electronic' } },
];

/** Какие категории показать первыми для повода открытки. */
export const FIRST_FOR: Record<CategoryId, string[]> = {
  congrats: ['birthday', 'party', 'happy', 'dance'],
  wishes: ['happy', 'pop', 'acoustic', 'jazz'],
  sympathy: ['calm', 'piano', 'sad', 'classical'],
  funny: ['funny', 'happy', 'party', 'electronic'],
  kind: ['kids', 'lullaby', 'acoustic', 'happy'],
  love: ['love', 'romantic', 'wedding', 'piano'],
};

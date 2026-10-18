import type { AnimId, CategoryId, FilterId, FrameId, Lang, TextAnimId } from '../types';

interface Dict {
  appName: string;
  tagline: string;
  chooseCategory: string;
  categories: Record<CategoryId, { name: string; hint: string }>;
  tabs: { background: string; filters: string; stickers: string; frames: string; text: string; animation: string };
  filters: Record<FilterId, string>;
  frames: Record<FrameId, string>;
  anims: Record<AnimId, string>;
  textAnims: Record<TextAnimId, string>;
  ui: {
    back: string;
    uploadPhoto: string;
    builtin: string;
    phrases: string;
    ownText: string;
    color: string;
    font: string;
    size: string;
    textEffect: string;
    remove: string;
    clearStickers: string;
    stickerHint: string;
    savePng: string;
    saveVideo: string;
    share: string;
    copy: string;
    copied: string;
    recording: string;
    shared: string;
    downloaded: string;
    noVideo: string;
    sendTitle: string;
    asImage: string;
    asVideo: string;
    videoReady: string;
    saveFile: string;
  };
}

const ru: Dict = {
  appName: 'Открытки',
  tagline: 'Выберите повод — остальное мы уже подготовили',
  chooseCategory: 'Какой повод?',
  categories: {
    congrats: { name: 'Поздравление', hint: 'День рождения, праздники' },
    wishes: { name: 'Пожелание', hint: 'Успеха, хорошего дня' },
    sympathy: { name: 'Сочувствие', hint: 'Поддержка, соболезнование' },
    funny: { name: 'Смешное', hint: 'Мемы и юмор' },
    kind: { name: 'Доброе', hint: 'Котики, природа' },
    love: { name: 'Признание', hint: 'Любовь, благодарность' },
  },
  tabs: { background: 'Фон', filters: 'Фильтры', stickers: 'Стикеры', frames: 'Рамки', text: 'Текст', animation: 'Анимация' },
  filters: { none: 'Без фильтра', retro: 'Ретро', bright: 'Яркий', bw: 'Ч/Б', soft: 'Мягкий фокус' },
  frames: { none: 'Без рамки', classic: 'Классика', gold: 'Золото', polaroid: 'Полароид', hearts: 'Сердечки', flowers: 'Цветы', sparkles: 'Блёстки', party: 'Праздник' },
  anims: { none: 'Без анимации', snow: 'Снежинки', petals: 'Лепестки', lights: 'Огоньки', sparkles: 'Мерцание', hearts: 'Сердечки', confetti: 'Конфетти', bokeh: 'Мягкий свет' },
  textAnims: { none: 'Статичный', pulse: 'Пульс', bounce: 'Прыжки', typewriter: 'Печать', glow: 'Сияние' },
  ui: {
    back: 'Назад',
    uploadPhoto: 'Моё фото',
    builtin: 'Готовые фоны',
    phrases: 'Выберите фразу',
    ownText: 'Изменить текст',
    color: 'Цвет',
    font: 'Шрифт',
    size: 'Размер',
    textEffect: 'Эффект текста',
    remove: 'Удалить',
    clearStickers: 'Убрать все',
    stickerHint: 'Нажмите на стикер — он появится на открытке. Перетаскивайте пальцем.',
    savePng: 'Картинка',
    saveVideo: 'Видео',
    share: 'Отправить',
    copy: 'Копировать',
    copied: 'Скопировано!',
    recording: 'Запись анимации…',
    shared: 'Отправлено!',
    downloaded: 'Файл сохранён',
    noVideo: 'Этот браузер не умеет сохранять видео — сохраним картинку',
    sendTitle: 'Как отправить?',
    asImage: 'Картинкой',
    asVideo: 'Анимацией (видео)',
    videoReady: 'Видео готово!',
    saveFile: 'Сохранить на устройство',
  },
};

const he: Dict = {
  appName: 'גלויות',
  tagline: 'בחרו אירוע — את השאר כבר הכנו',
  chooseCategory: 'מה האירוע?',
  categories: {
    congrats: { name: 'ברכה', hint: 'יום הולדת, חגים' },
    wishes: { name: 'איחול', hint: 'הצלחה, יום טוב' },
    sympathy: { name: 'השתתפות', hint: 'תמיכה, תנחומים' },
    funny: { name: 'מצחיק', hint: 'מימים והומור' },
    kind: { name: 'חמוד', hint: 'חתולים, טבע' },
    love: { name: 'הוקרה', hint: 'אהבה, תודה' },
  },
  tabs: { background: 'רקע', filters: 'פילטרים', stickers: 'מדבקות', frames: 'מסגרות', text: 'טקסט', animation: 'אנימציה' },
  filters: { none: 'ללא', retro: 'רטרו', bright: 'בהיר', bw: 'שחור־לבן', soft: 'פוקוס רך' },
  frames: { none: 'ללא', classic: 'קלאסי', gold: 'זהב', polaroid: 'פולרואיד', hearts: 'לבבות', flowers: 'פרחים', sparkles: 'נצנצים', party: 'חגיגה' },
  anims: { none: 'ללא', snow: 'פתיתי שלג', petals: 'עלי כותרת', lights: 'אורות', sparkles: 'נצנוץ', hearts: 'לבבות', confetti: 'קונפטי', bokeh: 'אור רך' },
  textAnims: { none: 'סטטי', pulse: 'פעימה', bounce: 'קפיצה', typewriter: 'הקלדה', glow: 'זוהר' },
  ui: {
    back: 'חזרה',
    uploadPhoto: 'התמונה שלי',
    builtin: 'רקעים מוכנים',
    phrases: 'בחרו משפט',
    ownText: 'עריכת טקסט',
    color: 'צבע',
    font: 'גופן',
    size: 'גודל',
    textEffect: 'אפקט טקסט',
    remove: 'מחיקה',
    clearStickers: 'הסרת הכל',
    stickerHint: 'לחצו על מדבקה כדי להוסיף אותה. אפשר לגרור באצבע.',
    savePng: 'תמונה',
    saveVideo: 'וידאו',
    share: 'שליחה',
    copy: 'העתקה',
    copied: 'הועתק!',
    recording: 'מקליט אנימציה…',
    shared: 'נשלח!',
    downloaded: 'הקובץ נשמר',
    noVideo: 'הדפדפן לא תומך בשמירת וידאו — נשמור תמונה',
    sendTitle: 'איך לשלוח?',
    asImage: 'כתמונה',
    asVideo: 'כאנימציה (וידאו)',
    videoReady: 'הסרטון מוכן!',
    saveFile: 'שמירה במכשיר',
  },
};

const en: Dict = {
  appName: 'Cards',
  tagline: 'Pick an occasion — we have prepared the rest',
  chooseCategory: "What's the occasion?",
  categories: {
    congrats: { name: 'Congrats', hint: 'Birthdays, holidays' },
    wishes: { name: 'Wishes', hint: 'Success, a good day' },
    sympathy: { name: 'Sympathy', hint: 'Support, condolences' },
    funny: { name: 'Funny', hint: 'Memes and humor' },
    kind: { name: 'Sweet', hint: 'Kittens, nature' },
    love: { name: 'Love & thanks', hint: 'Love, gratitude' },
  },
  tabs: { background: 'Background', filters: 'Filters', stickers: 'Stickers', frames: 'Frames', text: 'Text', animation: 'Animation' },
  filters: { none: 'Original', retro: 'Retro', bright: 'Vivid', bw: 'B&W', soft: 'Soft focus' },
  frames: { none: 'No frame', classic: 'Classic', gold: 'Gold', polaroid: 'Polaroid', hearts: 'Hearts', flowers: 'Flowers', sparkles: 'Sparkles', party: 'Party' },
  anims: { none: 'None', snow: 'Snowflakes', petals: 'Petals', lights: 'Fairy lights', sparkles: 'Twinkle', hearts: 'Hearts', confetti: 'Confetti', bokeh: 'Soft light' },
  textAnims: { none: 'Static', pulse: 'Pulse', bounce: 'Bounce', typewriter: 'Typewriter', glow: 'Glow' },
  ui: {
    back: 'Back',
    uploadPhoto: 'My photo',
    builtin: 'Ready backgrounds',
    phrases: 'Pick a phrase',
    ownText: 'Edit text',
    color: 'Color',
    font: 'Font',
    size: 'Size',
    textEffect: 'Text effect',
    remove: 'Delete',
    clearStickers: 'Clear all',
    stickerHint: 'Tap a sticker to add it to the card. Drag it with your finger.',
    savePng: 'Image',
    saveVideo: 'Video',
    share: 'Send',
    copy: 'Copy',
    copied: 'Copied!',
    recording: 'Recording animation…',
    shared: 'Sent!',
    downloaded: 'File saved',
    noVideo: "This browser can't save video — saving an image instead",
    sendTitle: 'How to send?',
    asImage: 'As an image',
    asVideo: 'As animation (video)',
    videoReady: 'Video is ready!',
    saveFile: 'Save to device',
  },
};

export const STRINGS: Record<Lang, Dict> = { ru, he, en };
export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'ru', label: 'Русский', flag: 'RU' },
  { id: 'he', label: 'עברית', flag: 'HE' },
  { id: 'en', label: 'English', flag: 'EN' },
];
export const RTL_LANGS: Lang[] = ['he'];

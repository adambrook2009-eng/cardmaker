import type { AnimId, CameraId, CategoryId, FilterId, FrameId, FxId, IntroId, Lang, LookId, SlideTransition, TextAnimId, TextStyleId } from '../types';
import type { TrackId } from '../data/music';
import type { PresetId } from '../data/fx';

interface Dict {
  appName: string;
  tagline: string;
  chooseCategory: string;
  categories: Record<CategoryId, { name: string; hint: string }>;
  tabs: { background: string; filters: string; stickers: string; frames: string; text: string; animation: string; music: string; effects: string };
  tracks: Record<TrackId, string>;
  fx: Record<FxId, string>;
  looks: Record<LookId, string>;
  cameras: Record<CameraId, string>;
  intros: Record<IntroId, string>;
  textStyles: Record<TextStyleId, string>;
  presets: Record<PresetId, { name: string; hint: string }>;
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
    imageReady: string;
    previewTitle: string;
    edit: string;
    uploadPhotos: string;
    addPhotos: string;
    photosLoading: string;
    myPhotos: string;
    usePhotos: string;
    slideEvery: string;
    slideTransition: string;
    transitions: Record<SlideTransition, string>;
    slideshowHint: string;
    photosLimit: string;
    videoLength: string;
    oneMinute: string;
    sec: string;
    timeLeft: string;
    keepScreen: string;
    cancel: string;
    saveFile: string;
    musicPlay: string;
    musicStop: string;
    musicNone: string;
    musicOwn: string;
    musicHint: string;
    musicError: string;
    songsTitle: string;
    songsFallback: string;
    songsError: string;
    songLoading: string;
    songsCredit: string;
    songStart: string;
    melodiesTitle: string;
    musicOwnPick: string;
    webTitle: string;
    webPlaceholder: string;
    webSearch: string;
    webLoading: string;
    webNothing: string;
    webLoadError: string;
    webLinkTitle: string;
    webLinkHint: string;
    webLinkError: string;
    webNote: string;
    webNative: string;
    webOrCategory: string;
    webMore: string;
    webLess: string;
    webResultsFor: string;
    webTitleNotFound: string;
    webNoNative: string;
    webOtherLangs: string;
    presets: string;
    fxTitle: string;
    lookTitle: string;
    cameraTitle: string;
    introTitle: string;
    replay: string;
    textStyle: string;
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
  tabs: { background: 'Фон', filters: 'Фильтры', stickers: 'Стикеры', frames: 'Рамки', text: 'Текст', animation: 'Анимация', music: 'Музыка', effects: 'Эффекты' },
  fx: { none: 'Без эффекта', fireworks: 'Салют', aurora: 'Северное сияние', lensFlare: 'Блик объектива', goldDust: 'Золотая пыль', magic: 'Волшебство', starWarp: 'Гиперпрыжок', lightLeaks: 'Кинозасветка' },
  looks: { none: 'Обычная', glow: 'Свечение', cinema: 'Кино', dream: 'Мечта', neon: 'Неон', vintage: 'Старая плёнка' },
  cameras: { none: 'Статично', zoomIn: 'Наезд', zoomOut: 'Отъезд', pan: 'Панорама', float: 'Парение' },
  intros: { none: 'Сразу', fade: 'Из темноты', flash: 'Вспышка', iris: 'Диафрагма', curtain: 'Занавес' },
  textStyles: { plain: 'Обычный', gold: 'Золото', neon: 'Неон', extrude: 'Объёмный 3D' },
  presets: {
    hollywood: { name: 'Голливуд', hint: 'Блик, кино-цвет, золото' },
    salute: { name: 'Салют', hint: 'Фейерверк в такт музыке' },
    magic: { name: 'Волшебство', hint: 'Палочка и сказочный свет' },
    aurora: { name: 'Северное сияние', hint: 'Ночное небо и неон' },
    neonParty: { name: 'Неон-пати', hint: 'Гиперпрыжок и неон' },
    gold: { name: 'Золото', hint: 'Занавес и золотая пыль' },
    retro: { name: 'Ретро-кино', hint: 'Старая плёнка, засветки' },
  },
  tracks: { birthday: 'С днём рождения', jingle: 'Jingle Bells', twinkle: 'Звёздочка', romantic: 'Романтика', calm: 'Спокойная', funny: 'Весёлая', party: 'Вечеринка' },
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
    imageReady: 'Открытка готова!',
    previewTitle: 'Предпросмотр',
    edit: 'Изменить',
    uploadPhotos: 'Мои фото (можно несколько)',
    addPhotos: 'Добавить ещё фото',
    photosLoading: 'Загружаем фото',
    myPhotos: 'Мои фото',
    usePhotos: 'Вернуть мои фото на фон',
    slideEvery: 'Смена фото каждые',
    slideTransition: 'Переход',
    transitions: { fade: 'Плавно', slide: 'Сдвиг', zoom: 'Зум' },
    slideshowHint: 'Слайд-шоу: {n} фото, полный круг — {s} с. В видео фото сменяются так же, как здесь.',
    photosLimit: 'Можно добавить не больше {n} фото — лишние пропущены.',
    videoLength: 'Длина видео',
    oneMinute: '1 мин',
    sec: 'с',
    timeLeft: 'Осталось {s} с',
    keepScreen: 'не выключайте экран',
    cancel: 'Отмена',
    saveFile: 'Сохранить на устройство',
    musicPlay: 'Слушать',
    musicStop: 'Пауза',
    musicNone: 'Без музыки',
    musicOwn: 'Своя музыка',
    musicHint: 'Музыка звучит в видео-открытке. На iPhone выключите беззвучный режим, чтобы слышать её здесь.',
    musicError: 'Не удалось открыть этот файл. Попробуйте MP3 или M4A.',
    songsTitle: 'Песни на русском',
    songsFallback: 'Песен на этом языке под этот повод пока нет — вот английские.',
    songsError: 'Не удалось загрузить песни. Проверьте интернет.',
    songLoading: 'Подбираем песни…',
    songsCredit: 'Свободные песни под лицензией Creative Commons от',
    songStart: 'Начать с',
    melodiesTitle: 'Мелодии',
    musicOwnPick: 'Выбрать песню с устройства',
    webTitle: 'Поиск музыки в интернете',
    webPlaceholder: 'Название песни…',
    webSearch: 'Найти',
    webLoading: 'Ищем…',
    webNothing: 'Ничего не нашлось. Попробуйте другое слово — по-английски находится больше.',
    webLoadError: 'Не удалось загрузить эту запись. Выберите другую.',
    webLinkTitle: 'Вставить ссылку на mp3',
    webLinkHint: 'Прямая ссылка на аудиофайл (например, из Dropbox). Некоторые сайты запрещают использовать свои файлы в других приложениях.',
    webLinkError: 'Не удалось открыть ссылку: сайт не разрешает или это не аудиофайл.',
    webNote: 'Только свободная музыка — общественное достояние и Creative Commons. Её можно законно вставлять в открытки.',
    webNative: 'На русском',
    webOrCategory: 'Или выберите категорию:',
    webMore: 'Ещё',
    webLess: 'Свернуть',
    webResultsFor: 'Песня',
    webTitleNotFound:
      'Песня «{q}» не найдена среди свободной музыки. Известные песни защищены авторским правом и в свободном доступе их нет — если песня есть у вас, добавьте её через «Своя музыка».',
    webNoNative:
      'Свободных песен на русском по этому запросу не нашлось — ниже похожие на других языках. Известные советские и современные песни защищены авторским правом, их здесь нет: используйте «Своя музыка».',
    webOtherLangs: 'На других языках',
    presets: 'Готовые стили — в один клик',
    fxTitle: 'Спецэффект',
    lookTitle: 'Кино-обработка',
    cameraTitle: 'Движение камеры',
    introTitle: 'Появление',
    replay: 'Показать с начала',
    textStyle: 'Стиль текста',
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
  tabs: { background: 'רקע', filters: 'פילטרים', stickers: 'מדבקות', frames: 'מסגרות', text: 'טקסט', animation: 'אנימציה', music: 'מוזיקה', effects: 'אפקטים' },
  fx: { none: 'ללא אפקט', fireworks: 'זיקוקים', aurora: 'זוהר צפוני', lensFlare: 'הבזק עדשה', goldDust: 'אבק זהב', magic: 'קסם', starWarp: 'קפיצה להיפר', lightLeaks: 'דליפת אור' },
  looks: { none: 'רגיל', glow: 'זוהר', cinema: 'קולנוע', dream: 'חלום', neon: 'ניאון', vintage: 'פילם ישן' },
  cameras: { none: 'סטטי', zoomIn: 'התקרבות', zoomOut: 'התרחקות', pan: 'פנורמה', float: 'ריחוף' },
  intros: { none: 'מיד', fade: 'מתוך החושך', flash: 'הבזק', iris: 'צמצם', curtain: 'מסך' },
  textStyles: { plain: 'רגיל', gold: 'זהב', neon: 'ניאון', extrude: 'תלת־ממד' },
  presets: {
    hollywood: { name: 'הוליווד', hint: 'הבזק, צבעי קולנוע, זהב' },
    salute: { name: 'זיקוקים', hint: 'זיקוקים בקצב המוזיקה' },
    magic: { name: 'קסם', hint: 'שרביט ואור אגדתי' },
    aurora: { name: 'זוהר צפוני', hint: 'שמי לילה וניאון' },
    neonParty: { name: 'מסיבת ניאון', hint: 'קפיצה להיפר וניאון' },
    gold: { name: 'זהב', hint: 'מסך ואבק זהב' },
    retro: { name: 'קולנוע רטרו', hint: 'פילם ישן ודליפות אור' },
  },
  tracks: { birthday: 'יום הולדת שמח', jingle: 'ג׳ינגל בלס', twinkle: 'כוכב קטן', romantic: 'רומנטי', calm: 'רגוע', funny: 'שמח ומצחיק', party: 'מסיבה' },
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
    imageReady: 'הגלויה מוכנה!',
    previewTitle: 'תצוגה מקדימה',
    edit: 'עריכה',
    uploadPhotos: 'התמונות שלי (אפשר כמה)',
    addPhotos: 'הוספת תמונות',
    photosLoading: 'טוענים תמונות',
    myPhotos: 'התמונות שלי',
    usePhotos: 'החזרת התמונות שלי לרקע',
    slideEvery: 'החלפת תמונה כל',
    slideTransition: 'מעבר',
    transitions: { fade: 'עמעום', slide: 'החלקה', zoom: 'זום' },
    slideshowHint: 'מצגת: {n} תמונות, סבב מלא — {s} שנ׳. בסרטון התמונות מתחלפות בדיוק כמו כאן.',
    photosLimit: 'אפשר להוסיף עד {n} תמונות — השאר דולגו.',
    videoLength: 'אורך הסרטון',
    oneMinute: 'דקה',
    sec: 'שנ׳',
    timeLeft: 'נותרו {s} שנ׳',
    keepScreen: 'אל תכבו את המסך',
    cancel: 'ביטול',
    saveFile: 'שמירה במכשיר',
    musicPlay: 'האזנה',
    musicStop: 'השהיה',
    musicNone: 'ללא מוזיקה',
    musicOwn: 'מוזיקה שלי',
    musicHint: 'המוזיקה נשמעת בגלויית הווידאו. באייפון כבו את מצב השקט כדי לשמוע אותה כאן.',
    musicError: 'לא ניתן לפתוח את הקובץ. נסו MP3 או M4A.',
    songsTitle: 'שירים בעברית',
    songsFallback: 'עדיין אין שירים בשפה הזאת לאירוע הזה — הנה שירים באנגלית.',
    songsError: 'לא ניתן לטעון שירים. בדקו את החיבור לאינטרנט.',
    songLoading: 'מחפשים שירים…',
    songsCredit: 'שירים חופשיים ברישיון Creative Commons מאת',
    songStart: 'להתחיל מ־',
    melodiesTitle: 'מנגינות',
    musicOwnPick: 'בחירת שיר מהמכשיר',
    webTitle: 'חיפוש מוזיקה באינטרנט',
    webPlaceholder: 'שם השיר…',
    webSearch: 'חיפוש',
    webLoading: 'מחפשים…',
    webNothing: 'לא נמצא כלום. נסו מילה אחרת — באנגלית יש יותר תוצאות.',
    webLoadError: 'לא ניתן לטעון את ההקלטה. בחרו אחרת.',
    webLinkTitle: 'הדבקת קישור ל־mp3',
    webLinkHint: 'קישור ישיר לקובץ שמע (למשל מ־Dropbox). חלק מהאתרים אוסרים שימוש בקבצים שלהם באפליקציות אחרות.',
    webLinkError: 'לא ניתן לפתוח את הקישור: האתר לא מאפשר או שזה לא קובץ שמע.',
    webNote: 'רק מוזיקה חופשית — נחלת הכלל ו־Creative Commons. מותר לשלב אותה בגלויות.',
    webNative: 'בעברית',
    webOrCategory: 'או בחרו קטגוריה:',
    webMore: 'עוד',
    webLess: 'פחות',
    webResultsFor: 'שיר',
    webTitleNotFound:
      'השיר «{q}» לא נמצא במוזיקה החופשית. שירים מוכרים מוגנים בזכויות יוצרים ואינם זמינים בחינם — אם השיר נמצא אצלכם, הוסיפו אותו דרך ״מוזיקה שלי״.',
    webNoNative: 'לא נמצאו שירים חופשיים בעברית לחיפוש הזה — למטה שירים דומים בשפות אחרות. שירים מוכרים מוגנים בזכויות יוצרים ואינם כאן: השתמשו ב״מוזיקה שלי״.',
    webOtherLangs: 'בשפות אחרות',
    presets: 'סגנונות מוכנים — בלחיצה אחת',
    fxTitle: 'אפקט מיוחד',
    lookTitle: 'עיבוד קולנועי',
    cameraTitle: 'תנועת מצלמה',
    introTitle: 'הופעה',
    replay: 'הצגה מההתחלה',
    textStyle: 'סגנון טקסט',
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
  tabs: { background: 'Background', filters: 'Filters', stickers: 'Stickers', frames: 'Frames', text: 'Text', animation: 'Animation', music: 'Music', effects: 'Effects' },
  fx: { none: 'No effect', fireworks: 'Fireworks', aurora: 'Northern lights', lensFlare: 'Lens flare', goldDust: 'Gold dust', magic: 'Magic', starWarp: 'Hyperspace', lightLeaks: 'Light leaks' },
  looks: { none: 'Normal', glow: 'Glow', cinema: 'Cinema', dream: 'Dream', neon: 'Neon', vintage: 'Old film' },
  cameras: { none: 'Static', zoomIn: 'Zoom in', zoomOut: 'Zoom out', pan: 'Pan', float: 'Float' },
  intros: { none: 'Instant', fade: 'Fade in', flash: 'Flash', iris: 'Iris', curtain: 'Curtain' },
  textStyles: { plain: 'Plain', gold: 'Gold', neon: 'Neon', extrude: '3D' },
  presets: {
    hollywood: { name: 'Hollywood', hint: 'Flare, cinema color, gold' },
    salute: { name: 'Fireworks', hint: 'Fireworks to the beat' },
    magic: { name: 'Magic', hint: 'Wand and fairy light' },
    aurora: { name: 'Northern lights', hint: 'Night sky and neon' },
    neonParty: { name: 'Neon party', hint: 'Hyperspace and neon' },
    gold: { name: 'Gold', hint: 'Curtain and gold dust' },
    retro: { name: 'Retro film', hint: 'Old film, light leaks' },
  },
  tracks: { birthday: 'Happy Birthday', jingle: 'Jingle Bells', twinkle: 'Twinkle Star', romantic: 'Romantic', calm: 'Calm', funny: 'Funny', party: 'Party' },
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
    imageReady: 'Your card is ready!',
    previewTitle: 'Preview',
    edit: 'Edit',
    uploadPhotos: 'My photos (several allowed)',
    addPhotos: 'Add more photos',
    photosLoading: 'Loading photos',
    myPhotos: 'My photos',
    usePhotos: 'Use my photos again',
    slideEvery: 'Change photo every',
    slideTransition: 'Transition',
    transitions: { fade: 'Fade', slide: 'Slide', zoom: 'Zoom' },
    slideshowHint: 'Slideshow: {n} photos, full loop — {s} s. In the video photos change exactly like here.',
    photosLimit: 'You can add up to {n} photos — the rest were skipped.',
    videoLength: 'Video length',
    oneMinute: '1 min',
    sec: 's',
    timeLeft: '{s} s left',
    keepScreen: "don't turn off the screen",
    cancel: 'Cancel',
    saveFile: 'Save to device',
    musicPlay: 'Listen',
    musicStop: 'Pause',
    musicNone: 'No music',
    musicOwn: 'My music',
    musicHint: 'Music plays in the video card. On iPhone, turn off silent mode to hear it here.',
    musicError: "Couldn't open this file. Try MP3 or M4A.",
    songsTitle: 'Songs in English',
    songsFallback: 'No songs in this language for this occasion yet — here are English ones.',
    songsError: "Couldn't load songs. Check your internet connection.",
    songLoading: 'Finding songs…',
    songsCredit: 'Free Creative Commons songs from',
    songStart: 'Start at',
    melodiesTitle: 'Melodies',
    musicOwnPick: 'Pick a song from your device',
    webTitle: 'Search music online',
    webPlaceholder: 'Song title…',
    webSearch: 'Search',
    webLoading: 'Searching…',
    webNothing: 'Nothing found. Try another word.',
    webLoadError: "Couldn't load this recording. Pick another one.",
    webLinkTitle: 'Paste an mp3 link',
    webLinkHint: 'A direct link to an audio file (e.g. from Dropbox). Some sites forbid using their files in other apps.',
    webLinkError: "Couldn't open the link: the site doesn't allow it or it's not an audio file.",
    webNote: 'Free music only — public domain and Creative Commons. It is legal to use in cards.',
    webNative: 'In English',
    webOrCategory: 'Or pick a category:',
    webMore: 'More',
    webLess: 'Less',
    webResultsFor: 'Song',
    webTitleNotFound:
      'The song “{q}” was not found among free music. Well-known songs are copyrighted and not freely available — if you have the song, add it via “My music”.',
    webNoNative: 'No free songs in this language for this search — similar ones in other languages below. Well-known songs are copyrighted and are not here: use “My music”.',
    webOtherLangs: 'In other languages',
    presets: 'Ready styles — one tap',
    fxTitle: 'Special effect',
    lookTitle: 'Cinematic look',
    cameraTitle: 'Camera motion',
    introTitle: 'Intro',
    replay: 'Replay from start',
    textStyle: 'Text style',
  },
};

export const STRINGS: Record<Lang, Dict> = { ru, he, en };
export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'ru', label: 'Русский', flag: 'RU' },
  { id: 'he', label: 'עברית', flag: 'HE' },
  { id: 'en', label: 'English', flag: 'EN' },
];
export const RTL_LANGS: Lang[] = ['he'];

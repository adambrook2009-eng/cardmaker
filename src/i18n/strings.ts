import type { AnimId, CameraId, CategoryId, ColorAdjust, FilterId, FrameId, FxId, IntroId, Lang, LookId, SlideTransition, TextAnimId, TextStyleId } from '../types';
import type { TrackId } from '../data/music';
import type { PresetId } from '../data/fx';
import type { MergeMode, PhotoOp } from '../engine/photoEdit';

interface Dict {
  appName: string;
  tagline: string;
  chooseCategory: string;
  categories: Record<CategoryId, { name: string; hint: string }>;
  tabs: { photos: string; background: string; filters: string; stickers: string; frames: string; text: string; animation: string; music: string; effects: string };
  tracks: Record<TrackId, string>;
  fx: Record<FxId, string>;
  looks: Record<LookId, string>;
  cameras: Record<CameraId, string>;
  intros: Record<IntroId, string>;
  textStyles: Record<TextStyleId, string>;
  presets: Record<PresetId, { name: string; hint: string }>;
  filters: Record<FilterId, string>;
  adjust: Record<keyof ColorAdjust, string>;
  photoOps: Record<PhotoOp, string>;
  mergeModes: Record<MergeMode, string>;
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
    preview: string;
    edit: string;
    liveBg: string;
    photoSectionTitle: string;
    peTapHint: string;
    peCommandLabel: string;
    pePlaceholder: string;
    peDoIt: string;
    peUndo: string;
    peDone: string;
    peMerged: string;
    peDeleted: string;
    peNoNumber: string;
    peBadNumber: string;
    peNeedTwo: string;
    peNotUnderstood: string;
    peExamples: string;
    hintSwap: string;
    swapTemplate: string;
    peSwapped: string;
    peNoPerson: string;
    peModelError: string;
    peSwapping: string;
    hintBgAsk: string;
    bgTemplate: string;
    peBgReplaced: string;
    peBgCredit: string;
    bgLooks: Record<'blur' | 'bw' | 'removed', string>;
    hintHair: string;
    hintClothes: string;
    peLooking: string;
    peLooked: string;
    peNoPart: string;
    peLookUnknown: string;
    lookParts: Record<'hair' | 'clothes', string>;
    lookPatterns: Record<'stripes' | 'dots' | 'checks', string>;
    lookTones: Record<'lighter' | 'darker', string>;
    lookNewColor: string;
    hintAiClothes: string;
    hintAiHair: string;
    peAiWorking: string;
    peAiDone: string;
    aiErrors: Record<'key' | 'quota' | 'blocked' | 'network' | 'cancelled', string>;
    aiConfirm: string;
    aiConfirmFree: string;
    aiFree: string;
    aiFreeAbout: string;
    aiOwnKeyTitle: string;
    aiTitle: string;
    aiOn: string;
    aiAbout: string;
    aiStep1: string;
    aiStep2: string;
    aiStep3: string;
    aiKeyPlaceholder: string;
    aiSaveKey: string;
    aiRemoveKey: string;
    gmButton: string;
    gmPrompt: string;
    gmSentTitle: string;
    gmStepShared: string;
    gmStepDesktop: string;
    gmStepPaste: string;
    gmStepType: string;
    gmStepSave: string;
    gmStepAdd: string;
    gmCopyAgain: string;
    gmClose: string;
    peBgNotFound: string;
    peNetError: string;
    hintBw: string;
    hintRotate: string;
    hintFlip: string;
    hintCrop: string;
    hintBrighter: string;
    hintWarm: string;
    hintVivid: string;
    hintSepia: string;
    hintBorder: string;
    hintMerge: string;
    hintBlend: string;
    hintDelete: string;
    colorPlay: string;
    filtersTitle: string;
    surprise: string;
    resetColors: string;
    themeSwitch: string;
    themeBeige: string;
    themeDark: string;
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
    cleanTitle: string;
    cleanApply: string;
    cleanHint: string;
    gradient: string;
    customColor: string;
    colorN: string;
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
  tabs: { photos: 'Фото', background: 'Фон', filters: 'Фильтры', stickers: 'Стикеры', frames: 'Рамки', text: 'Текст', animation: 'Анимация', music: 'Музыка', effects: 'Эффекты' },
  fx: { none: 'Без эффекта', fireworks: 'Салют', aurora: 'Северное сияние', lensFlare: 'Блик объектива', goldDust: 'Золотая пыль', magic: 'Волшебство', starWarp: 'Гиперпрыжок', lightLeaks: 'Кинозасветка', balloons: 'Воздушные шары', bubbles: 'Мыльные пузыри', shootingStars: 'Падающие звёзды', lanterns: 'Небесные фонарики', disco: 'Диско', butterflies: 'Бабочки' },
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
    balloonParty: { name: 'Воздушные шары', hint: 'Шары и конфетти в небе' },
    starryNight: { name: 'Звёздная ночь', hint: 'Падающие звёзды и неон' },
    lanternFestival: { name: 'Фонарики', hint: 'Небесные фонарики, золото' },
    discoNight: { name: 'Диско', hint: 'Зеркальный шар и лучи' },
    bubblesKids: { name: 'Мыльные пузыри', hint: 'Нежно и по-детски' },
    butterflyGarden: { name: 'Сад бабочек', hint: 'Бабочки, цветы, лепестки' },
  },
  tracks: { birthday: 'С днём рождения', jingle: 'Jingle Bells', twinkle: 'Звёздочка', romantic: 'Романтика', calm: 'Спокойная', funny: 'Весёлая', party: 'Вечеринка' },
  filters: {
    none: 'Без фильтра', bright: 'Яркий', warm: 'Тёплый', cool: 'Холодный', sunset: 'Закат', golden: 'Золотой час',
    retro: 'Ретро', film: 'Плёнка', fade: 'Матовый', pastel: 'Пастель', soft: 'Мягкий фокус', dramatic: 'Драма',
    lomo: 'Ломо', bw: 'Ч/Б', noir: 'Нуар', sepia: 'Сепия', arctic: 'Арктика', cyber: 'Кибер',
    duoPink: 'Розовый дуотон', duoBlue: 'Синий дуотон', invert: 'Негатив',
  },
  adjust: { brightness: 'Яркость', contrast: 'Контраст', saturate: 'Насыщенность', hue: 'Оттенок', warmth: 'Температура', fade: 'Выцветание', vignette: 'Виньетка' },
  photoOps: {
    rotateR: 'повёрнуто вправо', rotateL: 'повёрнуто влево', rotate180: 'перевёрнуто', flip: 'отражено', crop: 'обрезано квадратом',
    zoom: 'приближено', bw: 'чёрно-белое', sepia: 'сепия', invert: 'негатив', saturate: 'насыщеннее', desaturate: 'бледнее',
    brighter: 'ярче', darker: 'темнее', contrast: 'контрастнее', warm: 'теплее', cool: 'холоднее', blur: 'размыто', sharpen: 'резче',
    vignette: 'виньетка', border: 'рамка', round: 'скруглены углы', delete: 'удалено', duplicate: 'скопировано', first: 'на первом месте',
  },
  mergeModes: { collage: 'коллаж', horizontal: 'рядом', vertical: 'друг под другом', blend: 'наложением' },
  frames: { none: 'Без рамки', classic: 'Классика', gold: 'Золото', polaroid: 'Полароид', hearts: 'Сердечки', flowers: 'Цветы', sparkles: 'Блёстки', party: 'Праздник' },
  anims: { none: 'Без анимации', snow: 'Снежинки', petals: 'Лепестки', lights: 'Огоньки', sparkles: 'Мерцание', hearts: 'Сердечки', confetti: 'Конфетти', bokeh: 'Мягкий свет', stars: 'Звёзды', coins: 'Монеты', leaves: 'Листопад', fireflies: 'Светлячки', notes: 'Ноты', ribbons: 'Серпантин', emojiRain: 'Смайлики', rings: 'Неоновые кольца', rain: 'Дождь' },
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
    preview: 'Просмотр',
    edit: 'Изменить',
    liveBg: 'живой фон: двигается в видео',
    photoSectionTitle: 'Добавить и изменить фото',
    peTapHint: 'Нажмите на фото, чтобы отметить его. Номер фото — в левом верхнем углу.',
    peCommandLabel: 'Что сделать? Напишите номер фото и что изменить — или номера фото, которые объединить',
    pePlaceholder: 'Например: 1 чёрно-белое; объединить 1 2 3; фон 2 вместо фона 1; 1 фон горы',
    peDoIt: 'Сделать это',
    peUndo: 'Отменить',
    peDone: 'Фото {n}: {what}',
    peMerged: 'Фото {n} объединены ({mode}) — новое фото № {r}',
    peDeleted: 'Удалено фото {n}',
    peNoNumber: '«{c}» — укажите номер фото (или отметьте фото нажатием)',
    peBadNumber: 'Нет фото с номером {n} — у вас всего {count}',
    peNeedTwo: 'Чтобы объединить, нужно минимум два номера фото, например: объединить 1 2',
    peNotUnderstood: 'Не понял «{c}»',
    peExamples:
      'Можно: повернуть влево/вправо, перевернуть, зеркально, обрезать квадратом, приблизить, чёрно-белое, сепия, негатив, ярче, темнее, контрастнее, насыщеннее, бледнее, теплее, холоднее, размыть, резче, виньетка, рамка, скруглить углы, копировать, на первое место, удалить, объединить (рядом / друг под другом / наложить). Слова «чуть» и «сильно» меняют силу. Фон: «1 на фоне 2», «1 фон горы», «1 фон Эйфелева башня», «1 белый фон», «размой фон на 1», «убери фон на 1».',
    hintSwap: 'человек на другой фон',
    swapTemplate: '{a} на фоне {b}',
    peSwapped: 'Человек с фото {p} на фоне фото {b} — новое фото № {r}',
    peNoPerson: 'На фото {p} не нашлось человека — замена фона работает для фото людей',
    peModelError: 'Не удалось загрузить распознавание людей. Проверьте интернет и попробуйте ещё раз',
    peSwapping: 'Меняем фон… (первый раз — до минуты)',
    hintBgAsk: 'фон по описанию',
    bgTemplate: 'поставь на фото {a} фон закат над морем',
    peBgReplaced: 'Фото {p}: новый фон — {d}. Новое фото № {r}',
    peBgCredit: 'фон:',
    bgLooks: { blur: 'размытый', bw: 'чёрно-белый', removed: 'чистый белый' },
    hintHair: 'волосы рыжие',
    hintClothes: 'одежда синяя',
    peLooking: 'Ищем волосы и одежду…',
    peLooked: 'Фото {n}: {part} — {what}',
    peNoPart: 'На фото {p} не нашлись {part}',
    peLookUnknown:
      'Не понял, как изменить {part}. Можно: цвет (рыжий, блонд, каштановый, седой, чёрный, синий, красный…), «светлее» или «темнее», а для одежды — узор: полоски, горошек, клетка. Например: «1 волосы рыжие», «2 одежда в полоску». Поменять фасон одежды или форму причёски пока нельзя',
    lookParts: { hair: 'волосы', clothes: 'одежда' },
    lookPatterns: { stripes: 'полоски', dots: 'горошек', checks: 'клетка' },
    lookTones: { lighter: 'светлее', darker: 'темнее' },
    lookNewColor: 'новый цвет',
    hintAiClothes: 'надень на него костюм',
    hintAiHair: 'сделай короткую стрижку',
    peAiWorking: 'ИИ меняет фото… (обычно 30–60 секунд)',
    peAiDone: 'Фото {p}: {c}',
    aiErrors: {
      key: 'Ключ ИИ не подошёл. Проверьте, что скопировали его полностью, и введите заново',
      quota: 'Бесплатный лимит на этот месяц закончился (или слишком много запросов подряд). Попробуйте позже',
      blocked: 'ИИ отказался менять это фото (правила Google). Попробуйте написать просьбу по-другому',
      network: 'Не удалось связаться с ИИ. Проверьте интернет и попробуйте ещё раз',
      cancelled: 'Вход в Puter отменён. Чтобы ИИ сработал бесплатно, нажмите «Сделать это» ещё раз, затем «Continue» — и войдите или зарегистрируйтесь',
    },
    aiConfirm:
      'Чтобы выполнить просьбу, фото будет отправлено в Google Gemini (ИИ). Это платно для владельца ключа — примерно 3–5 центов за фото. Отправить?',
    aiConfirmFree:
      'Чтобы выполнить просьбу, фото будет отправлено в бесплатный ИИ (Hugging Face, а если дневной лимит исчерпан — Puter). Отправить?',
    aiFree: 'бесплатно',
    aiFreeAbout:
      'Бесплатно и без регистрации — через Hugging Face (нейросеть FLUX Kontext): каждый день даётся бесплатный лимит, примерно несколько фото. Когда он закончится, программа перейдёт на запасной бесплатный сервис Puter — там нужно один раз войти или зарегистрироваться (тоже бесплатно, лимит на месяц). Фото отправляется только после вашего согласия.',
    aiOwnKeyTitle: 'Или свой ключ Google (необязательно, платно)',
    aiTitle: 'ИИ-редактор: одежда, причёска — что угодно',
    aiOn: 'свой ключ',
    aiAbout: 'Меняет фото так, как вы напишете: «1 надень на него костюм», «2 сделай длинные кудрявые волосы», «1 добавь очки».',
    aiStep1: 'Откройте',
    aiStep2: 'Войдите в Google, нажмите «Create API key» и подключите оплату (Billing) — у моделей для картинок нет бесплатного тарифа',
    aiStep3: 'Скопируйте ключ и вставьте сюда',
    aiKeyPlaceholder: 'Ключ Google AI (AIza…)',
    aiSaveKey: 'Подключить',
    aiRemoveKey: 'Отключить ИИ и удалить ключ',
    gmButton: 'Сделать в Gemini (бесплатно, в вашем аккаунте Google)',
    gmPrompt: 'Измени это фото: {c}. Лицо, позу и фон оставь как есть, чтобы фото выглядело естественно.',
    gmSentTitle: 'Фото {p} — в Gemini. Что дальше:',
    gmStepShared: 'В списке «Поделиться» выберите приложение Gemini',
    gmStepDesktop: 'Открылся сайт Gemini, а фото сохранилось в «Загрузки». Прикрепите его в Gemini (значок «＋» или перетащите)',
    gmStepPaste: 'Вставьте текст просьбы (он уже скопирован: удерживайте поле ввода → «Вставить» или Ctrl+V) и отправьте',
    gmStepType: 'Напишите в Gemini просьбу (текст ниже) и отправьте',
    gmStepSave: 'Сохраните готовую картинку из Gemini (на телефоне — удерживайте её → «Сохранить»)',
    gmStepAdd: 'Вернитесь сюда и нажмите «＋ Добавить ещё фото» — новое фото появится в списке',
    gmCopyAgain: 'Скопировать текст ещё раз',
    gmClose: 'Закрыть',
    peBgNotFound: 'Не нашёл фон «{d}». Попробуйте написать по-другому, например: море, горы, лес, город ночью, белый, размытый',
    peNetError: 'Не удалось найти фон в интернете. Проверьте подключение и попробуйте ещё раз',
    hintBw: 'чёрно-белое',
    hintRotate: 'повернуть вправо',
    hintFlip: 'отразить зеркально',
    hintCrop: 'обрезать квадратом',
    hintBrighter: 'ярче',
    hintWarm: 'теплее',
    hintVivid: 'насыщеннее',
    hintSepia: 'сепия',
    hintBorder: 'рамка',
    hintMerge: 'объединить',
    hintBlend: 'объединить наложением',
    hintDelete: 'удалить',
    colorPlay: 'Игра с цветом',
    filtersTitle: 'Фильтры',
    surprise: 'Случайно',
    resetColors: 'Сбросить',
    themeSwitch: 'Сменить цвет интерфейса',
    themeBeige: 'Светлый',
    themeDark: 'Тёмный',
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
    cleanTitle: 'Чистый экран',
    cleanApply: 'Чистый экран',
    cleanHint: 'Только цвет, ваш текст и стикеры — без эффектов',
    gradient: 'Градиент из двух цветов',
    customColor: 'Свой цвет',
    colorN: 'Цвет {n}',
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
  tabs: { photos: 'תמונות', background: 'רקע', filters: 'פילטרים', stickers: 'מדבקות', frames: 'מסגרות', text: 'טקסט', animation: 'אנימציה', music: 'מוזיקה', effects: 'אפקטים' },
  fx: { none: 'ללא אפקט', fireworks: 'זיקוקים', aurora: 'זוהר צפוני', lensFlare: 'הבזק עדשה', goldDust: 'אבק זהב', magic: 'קסם', starWarp: 'קפיצה להיפר', lightLeaks: 'דליפת אור', balloons: 'בלונים', bubbles: 'בועות סבון', shootingStars: 'כוכבים נופלים', lanterns: 'פנסי שמיים', disco: 'דיסקו', butterflies: 'פרפרים' },
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
    balloonParty: { name: 'בלונים', hint: 'בלונים וקונפטי בשמיים' },
    starryNight: { name: 'ליל כוכבים', hint: 'כוכבים נופלים וניאון' },
    lanternFestival: { name: 'פנסים', hint: 'פנסי שמיים וזהב' },
    discoNight: { name: 'דיסקו', hint: 'כדור מראות וקרני אור' },
    bubblesKids: { name: 'בועות סבון', hint: 'עדין וילדותי' },
    butterflyGarden: { name: 'גן פרפרים', hint: 'פרפרים, פרחים, עלי כותרת' },
  },
  tracks: { birthday: 'יום הולדת שמח', jingle: 'ג׳ינגל בלס', twinkle: 'כוכב קטן', romantic: 'רומנטי', calm: 'רגוע', funny: 'שמח ומצחיק', party: 'מסיבה' },
  filters: {
    none: 'ללא', bright: 'עז', warm: 'חם', cool: 'קר', sunset: 'שקיעה', golden: 'שעת זהב',
    retro: 'רטרו', film: 'פילם', fade: 'מט', pastel: 'פסטל', soft: 'פוקוס רך', dramatic: 'דרמה',
    lomo: 'לומו', bw: 'שחור־לבן', noir: 'נואר', sepia: 'ספיה', arctic: 'ארקטי', cyber: 'סייבר',
    duoPink: 'דואוטון ורוד', duoBlue: 'דואוטון כחול', invert: 'נגטיב',
  },
  adjust: { brightness: 'בהירות', contrast: 'ניגודיות', saturate: 'רוויה', hue: 'גוון', warmth: 'טמפרטורה', fade: 'דהייה', vignette: 'וינייטה' },
  photoOps: {
    rotateR: 'סובבה ימינה', rotateL: 'סובבה שמאלה', rotate180: 'הופכה', flip: 'שיקוף', crop: 'נחתכה לריבוע',
    zoom: 'הוגדלה', bw: 'שחור לבן', sepia: 'ספיה', invert: 'נגטיב', saturate: 'צבעונית יותר', desaturate: 'דהויה יותר',
    brighter: 'בהירה יותר', darker: 'כהה יותר', contrast: 'ניגודיות', warm: 'חמה יותר', cool: 'קרה יותר', blur: 'טושטשה', sharpen: 'חדה יותר',
    vignette: 'וינייטה', border: 'מסגרת', round: 'פינות מעוגלות', delete: 'נמחקה', duplicate: 'שוכפלה', first: 'במקום הראשון',
  },
  mergeModes: { collage: 'קולאז׳', horizontal: 'בשורה', vertical: 'זו מעל זו', blend: 'בשכבות' },
  frames: { none: 'ללא', classic: 'קלאסי', gold: 'זהב', polaroid: 'פולרואיד', hearts: 'לבבות', flowers: 'פרחים', sparkles: 'נצנצים', party: 'חגיגה' },
  anims: { none: 'ללא', snow: 'פתיתי שלג', petals: 'עלי כותרת', lights: 'אורות', sparkles: 'נצנוץ', hearts: 'לבבות', confetti: 'קונפטי', bokeh: 'אור רך', stars: 'כוכבים', coins: 'מטבעות', leaves: 'שלכת', fireflies: 'גחליליות', notes: 'תווים', ribbons: 'סרפנטין', emojiRain: 'סמיילים', rings: 'טבעות ניאון', rain: 'גשם' },
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
    preview: 'צפייה',
    edit: 'עריכה',
    liveBg: 'רקע חי: זז בסרטון',
    photoSectionTitle: 'הוספה ועריכה של תמונות',
    peTapHint: 'לחצו על תמונה כדי לסמן אותה. מספר התמונה — בפינה.',
    peCommandLabel: 'מה לעשות? כתבו מספר תמונה ומה לשנות — או מספרי תמונות למיזוג',
    pePlaceholder: 'לדוגמה: 1 שחור לבן; 2 סובב ימינה; מזג 1 2 3',
    peDoIt: 'לבצע',
    peUndo: 'ביטול',
    peDone: 'תמונה {n}: {what}',
    peMerged: 'תמונות {n} מוזגו ({mode}) — תמונה חדשה מס׳ {r}',
    peDeleted: 'נמחקה תמונה {n}',
    peNoNumber: '«{c}» — ציינו מספר תמונה (או סמנו תמונה בלחיצה)',
    peBadNumber: 'אין תמונה מספר {n} — יש לכם רק {count}',
    peNeedTwo: 'כדי למזג צריך לפחות שני מספרים, לדוגמה: מזג 1 2',
    peNotUnderstood: 'לא הבנתי «{c}»',
    peExamples:
      'אפשר: סובב ימינה/שמאלה, הפוך, מראה, חתוך ריבוע, הגדל, שחור לבן, ספיה, נגטיב, בהיר יותר, כהה יותר, ניגודיות, צבעוני, דהוי, חם יותר, קר יותר, טשטש, חד, וינייטה, מסגרת, עגל פינות, שכפל, ראשונה, מחק, מזג (בשורה / אנכי / בשכבות). «קצת» ו«מאוד» משנים את העוצמה. רקע: «1 על רקע 2», «1 רקע הרים», «1 רקע לבן», «טשטש רקע 1».',
    hintSwap: 'אדם על רקע אחר',
    swapTemplate: 'תמונה {a} על רקע {b}',
    peSwapped: 'האדם מתמונה {p} על הרקע של תמונה {b} — תמונה חדשה מס׳ {r}',
    peNoPerson: 'לא נמצא אדם בתמונה {p} — החלפת רקע עובדת בתמונות של אנשים',
    peModelError: 'לא ניתן לטעון את זיהוי האנשים. בדקו את החיבור לאינטרנט ונסו שוב',
    peSwapping: 'מחליפים רקע… (בפעם הראשונה — עד דקה)',
    hintBgAsk: 'רקע לפי תיאור',
    bgTemplate: 'תמונה {a} רקע שקיעה על הים',
    peBgReplaced: 'תמונה {p}: רקע חדש — {d}. תמונה חדשה מס׳ {r}',
    peBgCredit: 'רקע:',
    bgLooks: { blur: 'מטושטש', bw: 'שחור לבן', removed: 'לבן נקי' },
    hintHair: 'שיער ג׳ינג׳י',
    hintClothes: 'בגדים כחולים',
    peLooking: 'מחפשים שיער ובגדים…',
    peLooked: 'תמונה {n}: {part} — {what}',
    peNoPart: 'בתמונה {p} לא נמצאו {part}',
    peLookUnknown:
      'לא הבנתי איך לשנות {part}. אפשר: צבע (ג׳ינג׳י, בלונד, ערמוני, כסוף, שחור, כחול, אדום…), «בהיר» או «כהה», ולבגדים — דוגמה: פסים, נקודות, משבצות. לדוגמה: «1 שיער ג׳ינג׳י», «2 בגדים בפסים». לשנות גזרה של בגד או צורת תספורת עדיין אי אפשר',
    lookParts: { hair: 'שיער', clothes: 'בגדים' },
    lookPatterns: { stripes: 'פסים', dots: 'נקודות', checks: 'משבצות' },
    lookTones: { lighter: 'בהיר יותר', darker: 'כהה יותר' },
    lookNewColor: 'צבע חדש',
    hintAiClothes: 'תלביש לו חליפה',
    hintAiHair: 'תספורת קצרה',
    peAiWorking: 'הבינה המלאכותית משנה את התמונה… (בדרך כלל 30–60 שניות)',
    peAiDone: 'תמונה {p}: {c}',
    aiErrors: {
      key: 'מפתח ה-AI לא מתאים. ודאו שהעתקתם אותו במלואו והזינו שוב',
      quota: 'המכסה החינמית לחודש הזה נגמרה (או שיש יותר מדי בקשות ברצף). נסו מאוחר יותר',
      blocked: 'ה-AI סירב לשנות את התמונה (כללי Google). נסו לנסח אחרת',
      network: 'אין חיבור ל-AI. בדקו את האינטרנט ונסו שוב',
      cancelled: 'ההתחברות ל-Puter בוטלה. כדי שה-AI יעבוד בחינם, לחצו «לבצע» שוב, אחר כך «Continue» — והתחברו או הירשמו',
    },
    aiConfirm: 'כדי לבצע את הבקשה, התמונה תישלח ל-Google Gemini (AI). זה בתשלום לבעל המפתח — בערך 3–5 סנט לתמונה. לשלוח?',
    aiConfirmFree: 'כדי לבצע את הבקשה, התמונה תישלח ל-AI חינמי (Hugging Face, ואם המכסה היומית נגמרה — Puter). לשלוח?',
    aiFree: 'בחינם',
    aiFreeAbout:
      'בחינם וללא הרשמה — דרך Hugging Face (רשת FLUX Kontext): בכל יום יש מכסה חינמית של כמה תמונות. כשהיא נגמרת, התוכנה עוברת לשירות החינמי הנוסף Puter — שם צריך להתחבר או להירשם פעם אחת (גם בחינם, מכסה חודשית). התמונה נשלחת רק אחרי אישורכם.',
    aiOwnKeyTitle: 'או מפתח Google משלכם (לא חובה, בתשלום)',
    aiTitle: 'עורך AI: בגדים, תסרוקת — כל דבר',
    aiOn: 'מפתח משלכם',
    aiAbout: 'משנה את התמונה כפי שתכתבו: «1 תלביש לו חליפה», «2 שיער ארוך ומתולתל», «1 תוסיף משקפיים».',
    aiStep1: 'פתחו את',
    aiStep2: 'התחברו ל-Google, לחצו «Create API key» והגדירו חיוב (Billing) — למודלי תמונות אין מסלול חינמי',
    aiStep3: 'העתיקו את המפתח והדביקו כאן',
    aiKeyPlaceholder: 'מפתח Google AI (AIza…)',
    aiSaveKey: 'לחבר',
    aiRemoveKey: 'לנתק את ה-AI ולמחוק את המפתח',
    gmButton: 'לעשות ב-Gemini (בחינם, בחשבון Google שלכם)',
    gmPrompt: 'שנה את התמונה הזאת: {c}. השאר את הפנים, התנוחה והרקע כמו שהם, כדי שהתמונה תיראה טבעית.',
    gmSentTitle: 'תמונה {p} — ב-Gemini. מה הלאה:',
    gmStepShared: 'ברשימת «שיתוף» בחרו באפליקציית Gemini',
    gmStepDesktop: 'אתר Gemini נפתח, והתמונה נשמרה ב«הורדות». צרפו אותה ב-Gemini (סמל «＋» או גרירה)',
    gmStepPaste: 'הדביקו את טקסט הבקשה (הוא כבר הועתק: לחיצה ארוכה על שדה ההקלדה → «הדבק» או Ctrl+V) ושלחו',
    gmStepType: 'כתבו ב-Gemini את הבקשה (הטקסט למטה) ושלחו',
    gmStepSave: 'שמרו את התמונה המוכנה מ-Gemini (בטלפון — לחיצה ארוכה → «שמור»)',
    gmStepAdd: 'חזרו לכאן ולחצו «＋ הוספת תמונות» — התמונה החדשה תופיע ברשימה',
    gmCopyAgain: 'להעתיק את הטקסט שוב',
    gmClose: 'סגירה',
    peBgNotFound: 'לא נמצא רקע «{d}». נסו לכתוב אחרת, לדוגמה: ים, הרים, יער, עיר בלילה, לבן, מטושטש',
    peNetError: 'לא ניתן למצוא רקע באינטרנט. בדקו את החיבור ונסו שוב',
    hintBw: 'שחור לבן',
    hintRotate: 'סובב ימינה',
    hintFlip: 'מראה',
    hintCrop: 'חתוך ריבוע',
    hintBrighter: 'בהיר יותר',
    hintWarm: 'חם יותר',
    hintVivid: 'צבעוני',
    hintSepia: 'ספיה',
    hintBorder: 'מסגרת',
    hintMerge: 'מזג',
    hintBlend: 'מזג בשכבות',
    hintDelete: 'מחק',
    colorPlay: 'משחק בצבעים',
    filtersTitle: 'פילטרים',
    surprise: 'אקראי',
    resetColors: 'איפוס',
    themeSwitch: 'החלפת צבע הממשק',
    themeBeige: 'בהיר',
    themeDark: 'כהה',
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
    cleanTitle: 'מסך נקי',
    cleanApply: 'מסך נקי',
    cleanHint: 'רק צבע, הטקסט והמדבקות שלכם — בלי אפקטים',
    gradient: 'מעבר בין שני צבעים',
    customColor: 'צבע משלכם',
    colorN: 'צבע {n}',
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
  tabs: { photos: 'Photos', background: 'Background', filters: 'Filters', stickers: 'Stickers', frames: 'Frames', text: 'Text', animation: 'Animation', music: 'Music', effects: 'Effects' },
  fx: { none: 'No effect', fireworks: 'Fireworks', aurora: 'Northern lights', lensFlare: 'Lens flare', goldDust: 'Gold dust', magic: 'Magic', starWarp: 'Hyperspace', lightLeaks: 'Light leaks', balloons: 'Balloons', bubbles: 'Soap bubbles', shootingStars: 'Shooting stars', lanterns: 'Sky lanterns', disco: 'Disco', butterflies: 'Butterflies' },
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
    balloonParty: { name: 'Balloons', hint: 'Balloons and confetti in the sky' },
    starryNight: { name: 'Starry night', hint: 'Shooting stars and neon' },
    lanternFestival: { name: 'Lanterns', hint: 'Sky lanterns and gold' },
    discoNight: { name: 'Disco', hint: 'Mirror ball and beams' },
    bubblesKids: { name: 'Soap bubbles', hint: 'Soft and playful' },
    butterflyGarden: { name: 'Butterfly garden', hint: 'Butterflies, flowers, petals' },
  },
  tracks: { birthday: 'Happy Birthday', jingle: 'Jingle Bells', twinkle: 'Twinkle Star', romantic: 'Romantic', calm: 'Calm', funny: 'Funny', party: 'Party' },
  filters: {
    none: 'Original', bright: 'Vivid', warm: 'Warm', cool: 'Cool', sunset: 'Sunset', golden: 'Golden hour',
    retro: 'Retro', film: 'Film', fade: 'Matte', pastel: 'Pastel', soft: 'Soft focus', dramatic: 'Drama',
    lomo: 'Lomo', bw: 'B&W', noir: 'Noir', sepia: 'Sepia', arctic: 'Arctic', cyber: 'Cyber',
    duoPink: 'Pink duotone', duoBlue: 'Blue duotone', invert: 'Negative',
  },
  adjust: { brightness: 'Brightness', contrast: 'Contrast', saturate: 'Saturation', hue: 'Hue', warmth: 'Temperature', fade: 'Fade', vignette: 'Vignette' },
  photoOps: {
    rotateR: 'rotated right', rotateL: 'rotated left', rotate180: 'turned upside down', flip: 'mirrored', crop: 'cropped square',
    zoom: 'zoomed in', bw: 'black and white', sepia: 'sepia', invert: 'negative', saturate: 'more vivid', desaturate: 'muted',
    brighter: 'brighter', darker: 'darker', contrast: 'more contrast', warm: 'warmer', cool: 'cooler', blur: 'blurred', sharpen: 'sharper',
    vignette: 'vignette', border: 'border', round: 'rounded corners', delete: 'deleted', duplicate: 'copied', first: 'moved first',
  },
  mergeModes: { collage: 'collage', horizontal: 'side by side', vertical: 'stacked', blend: 'overlay' },
  frames: { none: 'No frame', classic: 'Classic', gold: 'Gold', polaroid: 'Polaroid', hearts: 'Hearts', flowers: 'Flowers', sparkles: 'Sparkles', party: 'Party' },
  anims: { none: 'None', snow: 'Snowflakes', petals: 'Petals', lights: 'Fairy lights', sparkles: 'Twinkle', hearts: 'Hearts', confetti: 'Confetti', bokeh: 'Soft light', stars: 'Stars', coins: 'Coins', leaves: 'Falling leaves', fireflies: 'Fireflies', notes: 'Music notes', ribbons: 'Streamers', emojiRain: 'Emoji rain', rings: 'Neon rings', rain: 'Rain' },
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
    preview: 'Play',
    edit: 'Edit',
    liveBg: 'live background: moves in the video',
    photoSectionTitle: 'Add and edit photos',
    peTapHint: 'Tap a photo to select it. The photo number is in the corner.',
    peCommandLabel: 'What to do? Write a photo number and what to change — or photo numbers to merge',
    pePlaceholder: 'For example: 1 black and white; 2 rotate right; merge 1 2 3',
    peDoIt: 'Do it',
    peUndo: 'Undo',
    peDone: 'Photo {n}: {what}',
    peMerged: 'Photos {n} merged ({mode}) — new photo #{r}',
    peDeleted: 'Deleted photo {n}',
    peNoNumber: '“{c}” — add a photo number (or tap a photo to select it)',
    peBadNumber: 'There is no photo {n} — you have {count}',
    peNeedTwo: 'To merge, give at least two photo numbers, e.g.: merge 1 2',
    peNotUnderstood: 'Didn’t understand “{c}”',
    peExamples:
      'You can: rotate right/left, upside down, mirror, crop square, zoom, black and white, sepia, negative, brighter, darker, contrast, vivid, muted, warmer, cooler, blur, sharpen, vignette, border, round corners, copy, move first, delete, merge (side by side / stack / overlay). “a bit” and “very” change the strength. Background: “1 on the background of 2”, “1 background mountains”, “1 white background”, “blur background 1”, “remove background 1”.',
    hintSwap: 'person on another background',
    swapTemplate: '{a} on the background of {b}',
    peSwapped: 'Person from photo {p} on the background of photo {b} — new photo #{r}',
    peNoPerson: 'No person found in photo {p} — background swap works for photos of people',
    peModelError: 'Could not load person detection. Check your internet connection and try again',
    peSwapping: 'Swapping background… (first time — up to a minute)',
    hintBgAsk: 'background by description',
    bgTemplate: 'photo {a} background sunset over the sea',
    peBgReplaced: 'Photo {p}: new background — {d}. New photo #{r}',
    peBgCredit: 'background:',
    bgLooks: { blur: 'blurred', bw: 'black and white', removed: 'plain white' },
    hintHair: 'hair ginger',
    hintClothes: 'clothes blue',
    peLooking: 'Finding hair and clothes…',
    peLooked: 'Photo {n}: {part} — {what}',
    peNoPart: 'No {part} found in photo {p}',
    peLookUnknown:
      'Didn’t understand how to change the {part}. You can: a color (ginger, blond, chestnut, silver, black, blue, red…), “lighter” or “darker”, and for clothes a pattern: stripes, polka dots, checks. E.g.: “1 hair ginger”, “2 clothes striped”. Changing the cut of clothes or the hairstyle shape isn’t possible yet',
    lookParts: { hair: 'hair', clothes: 'clothes' },
    lookPatterns: { stripes: 'stripes', dots: 'polka dots', checks: 'checks' },
    lookTones: { lighter: 'lighter', darker: 'darker' },
    lookNewColor: 'new color',
    hintAiClothes: 'put a suit on him',
    hintAiHair: 'give a short haircut',
    peAiWorking: 'AI is editing the photo… (usually 30–60 seconds)',
    peAiDone: 'Photo {p}: {c}',
    aiErrors: {
      key: 'The AI key didn’t work. Make sure you copied all of it and enter it again',
      quota: 'This month’s free limit has run out (or too many requests in a row). Try again later',
      blocked: 'The AI refused to change this photo (Google’s rules). Try wording it differently',
      network: 'Couldn’t reach the AI. Check your internet connection and try again',
      cancelled: 'Puter sign-in was canceled. For the free AI, tap “Do it” again, then “Continue” — and sign in or sign up',
    },
    aiConfirm: 'To do this, the photo will be sent to Google Gemini (AI). It’s paid by the key owner — about 3–5 cents per photo. Send it?',
    aiConfirmFree: 'To do this, the photo will be sent to a free AI (Hugging Face, or Puter if the daily limit is used up). Send it?',
    aiFree: 'free',
    aiFreeAbout:
      'Free and without sign-up — via Hugging Face (the FLUX Kontext model): there’s a free daily limit of a few photos. When it runs out, the app switches to the backup free service Puter — there you sign in or sign up once (also free, monthly limit). The photo is sent only after you agree.',
    aiOwnKeyTitle: 'Or your own Google key (optional, paid)',
    aiTitle: 'AI editor: clothes, hairstyle — anything',
    aiOn: 'own key',
    aiAbout: 'Changes the photo the way you write it: “1 put a suit on him”, “2 long curly hair”, “1 add glasses”.',
    aiStep1: 'Open',
    aiStep2: 'Sign in to Google, click “Create API key” and set up billing — image models have no free tier',
    aiStep3: 'Copy the key and paste it here',
    aiKeyPlaceholder: 'Google AI key (AIza…)',
    aiSaveKey: 'Connect',
    aiRemoveKey: 'Disconnect AI and delete the key',
    gmButton: 'Do it in Gemini (free, in your Google account)',
    gmPrompt: 'Edit this photo: {c}. Keep the face, pose and background as they are, so the photo looks natural.',
    gmSentTitle: 'Photo {p} — to Gemini. Next:',
    gmStepShared: 'In the “Share” list, choose the Gemini app',
    gmStepDesktop: 'The Gemini site opened and the photo was saved to Downloads. Attach it in Gemini (the “＋” icon or drag and drop)',
    gmStepPaste: 'Paste the request (it’s already copied: long-press the input → “Paste”, or Ctrl+V) and send',
    gmStepType: 'Type the request in Gemini (text below) and send',
    gmStepSave: 'Save the finished picture from Gemini (on a phone — long-press it → “Save”)',
    gmStepAdd: 'Come back here and tap “＋ Add more photos” — the new photo will appear in the list',
    gmCopyAgain: 'Copy the text again',
    gmClose: 'Close',
    peBgNotFound: 'Couldn’t find a “{d}” background. Try other words, e.g.: sea, mountains, forest, city at night, white, blurred',
    peNetError: 'Couldn’t search for a background online. Check your connection and try again',
    hintBw: 'black and white',
    hintRotate: 'rotate right',
    hintFlip: 'mirror',
    hintCrop: 'crop square',
    hintBrighter: 'brighter',
    hintWarm: 'warmer',
    hintVivid: 'more vivid',
    hintSepia: 'sepia',
    hintBorder: 'border',
    hintMerge: 'merge',
    hintBlend: 'merge as overlay',
    hintDelete: 'delete',
    colorPlay: 'Play with colors',
    filtersTitle: 'Filters',
    surprise: 'Surprise me',
    resetColors: 'Reset',
    themeSwitch: 'Change interface color',
    themeBeige: 'Light',
    themeDark: 'Dark',
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
    cleanTitle: 'Clean screen',
    cleanApply: 'Clean screen',
    cleanHint: 'Just a color, your text and stickers — no effects',
    gradient: 'Two-color gradient',
    customColor: 'Custom color',
    colorN: 'Color {n}',
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

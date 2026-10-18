# 💌 Открытки (CardMaker)

Кроссплатформенное приложение для создания и отправки открыток и анимаций.
Языки: русский, иврит (RTL), английский. Язык переключается на лету.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173 (и по IP в локальной сети, чтобы открыть с телефона)
npm run build      # production-сборка в dist/
npm run preview    # просмотр сборки
```

Диплинк: `?c=love` сразу открывает редактор нужной категории
(`congrats | wishes | sympathy | funny | kind | love`).

## Стек и почему он такой

| Слой | Выбор | Почему |
|---|---|---|
| UI | **React 18 + TypeScript + Vite** | Один код для всех платформ, быстрый старт, строгие типы |
| Рендер открытки | **Canvas 2D** (свой мини-движок) | Превью и экспорт рисует одна и та же функция, поэтому сохраняется ровно то, что видно на экране |
| Телефоны | **PWA** (manifest + service worker) | Ссылка открывается и сразу работает, есть «Добавить на главный экран» и офлайн |
| Десктоп | **Tauri 2** (опционально) | Нативный .exe/.dmg/.AppImage размером около 5–10 МБ, против 100+ МБ у Electron |
| Магазины (опционально) | **Capacitor** | Тот же `dist/` упаковывается в Android/iOS-приложение |
| Отправка | **Web Share API** + скачивание + буфер обмена | Системное меню «Поделиться» (WhatsApp, Telegram, почта) без серверов |
| Видео | **MediaRecorder + canvas.captureStream** | Анимированная открытка пишется в MP4/WebM прямо на устройстве |

Встроенный контент (фоны, рамки, анимации, стикеры) рисуется кодом и эмодзи.
Картинок в репозитории нет, сборка весит около 60 КБ gzip, и интерфейс наполнен с первого запуска.

## Структура

```
src/
├── main.tsx                 # точка входа + регистрация service worker
├── App.tsx                  # экраны: выбор категории → редактор
├── types.ts                 # модель открытки (CardState)
├── styles.css               # mobile-first, логические CSS-свойства (RTL «бесплатно»)
├── i18n/
│   ├── strings.ts           # все строки UI на ru/he/en
│   └── I18nProvider.tsx     # контекст языка, dir=rtl, запоминание выбора
├── data/                    # ← база контента, редактируется без знания движка
│   ├── categories.ts        # 6 категорий + пресеты (фон/анимация/рамка)
│   ├── phrases.ts           # готовые фразы: категория × язык
│   ├── stickers.ts          # наборы стикеров
│   └── options.ts           # фильтры, рамки, анимации, шрифты, цвета
├── engine/                  # ← движок рендера без React
│   ├── renderer.ts          # renderScene(): фон → фильтр → анимация → рамка → стикеры → текст
│   ├── backgrounds.ts       # 12 процедурных фонов
│   ├── frames.ts            # 7 рамок
│   ├── animations.ts        # частицы: снег, лепестки, огоньки, блёстки, сердечки, конфетти, боке
│   ├── export.ts            # PNG, видео, share/download/clipboard
│   └── utils.ts             # кэш offscreen-холстов, seeded random, хелперы
├── state/useCard.ts         # состояние редактора и действия
└── components/
    ├── CategoryPicker.tsx   # плитки категорий с живыми превью
    ├── Editor.tsx           # превью + вкладки инструментов
    ├── CardCanvas.tsx       # живой холст, drag-n-drop, колёсико = размер стикера
    ├── SendBar.tsx          # отправить / картинка / видео / копировать
    ├── LanguageSwitcher.tsx
    ├── Thumb.tsx            # миниатюры
    └── panels/              # Background, Text, Stickers, Animation, Frames, Filters
```

## Как добавить контент

- **Фразу:** дописать строку в `src/data/phrases.ts` (во все три языка).
- **Стикер:** добавить эмодзи в `src/data/stickers.ts`.
- **Фон-картинку:** положить файл в `public/backgrounds/` и добавить painter в `engine/backgrounds.ts`,
  который делает `drawImage` загруженного `Image`.
- **Анимацию:** новая фабрика в `engine/animations.ts`, id в `types.ts` и `data/options.ts`, название в `i18n/strings.ts`.
  TypeScript сам подскажет, где не хватает перевода.

## План реализации

1. ✅ **Каркас:** Vite + React + TS, i18n с RTL, PWA-манифест.
2. ✅ **Движок:** единый `renderScene`, процедурные фоны, рамки, фильтры, частицы.
3. ✅ **Редактор:** категории с пресетами, вкладки, готовые фразы, стикеры с перетаскиванием.
4. ✅ **Экспорт и отправка:** PNG, видео (MP4/WebM), Web Share, буфер обмена.
5. ⏭ **Жесты на телефоне:** pinch-zoom и поворот стикеров двумя пальцами, отмена (undo-стек в `useCard`).
6. ⏭ **Больше контента:** фоны-фотографии (WebP, ленивая загрузка), сезонные наборы (Новый год, Песах, 8 марта).
7. ⏭ **Анимированный GIF** как альтернатива видео (`gifenc`), потому что GIF понимают все мессенджеры.
8. ⏭ **Ссылка-открытка:** состояние сериализуется в JSON и сохраняется в хранилище (Supabase/Firebase),
   получатель открывает ссылку и видит живую анимацию.
9. ⏭ **Десктоп и магазины:** Tauri и Capacitor (ниже), иконки, подпись, CI-сборки.
10. ⏭ **Тесты:** Vitest для `useCard`/движка, Playwright для сценария «выбрать → украсить → сохранить» на трёх языках.

## Десктоп-приложение (Tauri)

Нужен Rust (https://rustup.rs). Затем:

```bash
npm i -D @tauri-apps/cli
npx tauri init        # devUrl: http://localhost:5173, frontendDist: ../dist
npx tauri dev
npx tauri build       # установщик для текущей ОС
```

## Мобильное приложение (Capacitor, для Google Play / App Store)

```bash
npm i @capacitor/core && npm i -D @capacitor/cli
npx cap init Открытки com.example.cardmaker --web-dir dist
npm run build && npx cap add android && npx cap open android
```

В нативной обёртке системное «Поделиться» для файлов надёжнее через плагин `@capacitor/share`.
Подключать его стоит в `engine/export.ts → shareOrDownload`.

## Совместимость

- `ctx.filter` (фильтры) поддерживается в Chrome, Edge, Firefox и Safari 18+. В старом Safari фото
  показывается без фильтра, остальное работает.
- Видео пишется в MP4 в Safari/iOS и новом Chrome, в WebM в остальных браузерах. Если запись недоступна,
  приложение сохраняет картинку.
- Web Share с файлами есть на Android, iOS, Windows и macOS (Chrome/Edge/Safari). В остальных случаях
  файл скачивается.

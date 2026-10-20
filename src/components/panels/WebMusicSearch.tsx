import { useEffect, useRef, useState } from 'react';
import type { CategoryId, Lang, MusicChoice } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { getAudioContext } from '../../engine/audio';
import { defaultOffset, fmtTime } from '../../engine/jamendo';
import { directLink, loadWebAudio, searchByCategory, searchByTitle, type Script, type WebSong } from '../../engine/webMusic';
import { FIRST_FOR, MUSIC_CATEGORIES, type MusicCategory } from '../../data/musicCategories';

/** Язык интерфейса → алфавит, на котором ищем песни «на своём языке». */
const UI_SCRIPT: Record<Lang, Script | null> = { ru: 'cyr', he: 'heb', en: null };

/** Что сейчас ищем: песню по названию или музыку категории. */
type Mode = { type: 'title'; q: string } | { type: 'category'; cat: MusicCategory } | null;

interface Props {
  category: CategoryId;
  activeId: string | undefined;
  onChoose: (m: MusicChoice) => void;
}

export function WebMusicSearch({ category, activeId, onChoose }: Props) {
  const { t, lang } = useI18n();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>(null);
  const [songs, setSongs] = useState<WebSong[] | null>(null);
  const [done, setDone] = useState(true);
  const [allCats, setAllCats] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const cancel = useRef<() => void>(() => {});

  useEffect(() => () => cancel.current(), []);

  const start = (m: NonNullable<Mode>, run: (cb: (s: WebSong[], fin: boolean) => void) => () => void) => {
    cancel.current();
    setMode(m);
    setSongs(null);
    setError('');
    setDone(false);
    cancel.current = run((res, fin) => {
      setSongs(res);
      setDone(fin);
    });
  };

  /** Поиск именно по введённому названию. */
  const findTitle = () => {
    const q = text.trim();
    if (q) start({ type: 'title', q }, (cb) => searchByTitle(q, cb));
  };

  /** Поиск по категории (кнопки ниже поля). */
  const findCategory = (cat: MusicCategory) => {
    setText('');
    start({ type: 'category', cat }, (cb) => searchByCategory(cat.tags, UI_SCRIPT[lang], cb));
  };

  // Категории: сначала подходящие к поводу открытки; «На русском» — только для ru/he
  const first = FIRST_FOR[category];
  const cats = MUSIC_CATEGORIES.filter((c) => c.label[lang]).sort((a, b) => {
    const ia = a.id === 'native' ? -1 : first.indexOf(a.id) === -1 ? 99 : first.indexOf(a.id);
    const ib = b.id === 'native' ? -1 : first.indexOf(b.id) === -1 ? 99 : first.indexOf(b.id);
    return ia - ib;
  });
  const shownCats = allCats ? cats : cats.slice(0, 7);

  const nativeTag = lang === 'ru' ? 'RU' : lang === 'he' ? 'עב' : '';
  const nativeCount = songs?.filter((s) => s.native).length ?? 0;

  const pick = async (s: WebSong) => {
    getAudioContext(); // «будим» звук прямо в обработчике нажатия
    setLoadingId(s.id);
    setError('');
    try {
      const buffer = await loadWebAudio(s.url, true);
      onChoose({ kind: 'file', name: s.title, buffer, offset: defaultOffset(buffer.duration), songId: s.id, credit: s.artist ? `${s.title} — ${s.artist}` : s.title, license: s.licenseUrl });
    } catch {
      setError(t.ui.webLoadError);
    } finally {
      setLoadingId(null);
    }
  };

  const addLink = async () => {
    const url = directLink(link);
    if (!/^https?:\/\//.test(url)) return;
    getAudioContext();
    setLoadingId('link');
    setError('');
    try {
      const buffer = await loadWebAudio(url);
      const name = decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? 'song').replace(/\.[^.]+$/, '') || 'song';
      onChoose({ kind: 'file', name, buffer, offset: defaultOffset(buffer.duration), songId: `link:${url}` });
      setLink('');
    } catch {
      setError(t.ui.webLinkError);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="web-music">
      {/* 1. По названию песни */}
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault();
          findTitle();
        }}
      >
        <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t.ui.webPlaceholder} dir="auto" enterKeyHint="search" />
        <button type="submit" className="primary-sm" aria-label={t.ui.webSearch}>
          🔍
        </button>
      </form>

      {/* 2. Или по категории */}
      <p className="hint">{t.ui.webOrCategory}</p>
      <div className="chips">
        {shownCats.map((c) => (
          <button
            key={c.id}
            className={`chip ${mode?.type === 'category' && mode.cat.id === c.id ? 'active' : ''}`}
            onClick={() => findCategory(c)}
          >
            {c.icon} {c.label[lang]}
          </button>
        ))}
        {cats.length > 7 && (
          <button className="chip ghost" onClick={() => setAllCats((v) => !v)}>
            {allCats ? `▲ ${t.ui.webLess}` : `▼ ${t.ui.webMore}`}
          </button>
        )}
      </div>

      {mode && (
        <p className="search-caption">
          {mode.type === 'title' ? `🔍 ${t.ui.webResultsFor} «${mode.q}»` : `${mode.cat.icon} ${mode.cat.label[lang]}`}
        </p>
      )}
      {error && <p className="hint error">{error}</p>}
      {!done && <p className="hint">{t.ui.webLoading}</p>}
      {done && songs?.length === 0 && (
        <p className="hint notice">{mode?.type === 'title' ? t.ui.webTitleNotFound.replace('{q}', mode.q) : t.ui.webNothing}</p>
      )}
      {done && mode?.type === 'category' && UI_SCRIPT[lang] && !!songs?.length && nativeCount === 0 && <p className="hint notice">{t.ui.webNoNative}</p>}

      {songs && songs.length > 0 && (
        <div className="song-list">
          {songs.map((s) => {
            const active = activeId === s.id;
            return (
              <button key={s.id} className={`song ${active ? 'active' : ''}`} onClick={() => pick(s)} disabled={loadingId !== null}>
                {s.image ? <img src={s.image} alt="" loading="lazy" /> : <span className="song-cover">{s.source === 'wikimedia' ? '📻' : s.source === 'archive' ? '💿' : '🎵'}</span>}
                <span className="song-meta">
                  <span className="song-name">
                    {s.native && nativeTag && <span className="lang-tag">{nativeTag}</span>}
                    {s.title}
                  </span>
                  <span className="song-artist">
                    {s.artist} · {s.license}
                  </span>
                </span>
                <span className="song-dur">{loadingId === s.id ? '⏳' : active ? '🔊' : fmtTime(s.duration)}</span>
              </button>
            );
          })}
        </div>
      )}

      <details className="link-box">
        <summary>🔗 {t.ui.webLinkTitle}</summary>
        <form
          className="search-row"
          onSubmit={(e) => {
            e.preventDefault();
            addLink();
          }}
        >
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/song.mp3" dir="ltr" />
          <button type="submit" className="primary-sm" disabled={loadingId !== null}>
            {loadingId === 'link' ? '⏳' : '➕'}
          </button>
        </form>
        <p className="hint">{t.ui.webLinkHint}</p>
      </details>

      <p className="hint">{t.ui.webNote}</p>
    </div>
  );
}

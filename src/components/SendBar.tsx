import { useRef, useState } from 'react';
import type { CardState } from '../types';
import { useI18n } from '../i18n/I18nProvider';
import { canRecordVideo, copyImage, download, exportPNG, exportVideo, extFor, shareOrDownload } from '../engine/export';

const hasMotion = (c: CardState) =>
  c.animation !== 'none' || c.text.anim !== 'none' || c.music.kind !== 'none' || c.fx !== 'none' || c.camera !== 'none' || c.intro !== 'none';

/** Длительность видео на выбор; по умолчанию — минута. Выбор запоминается. */
const DURATIONS = [15, 30, 60] as const;
const DUR_KEY = 'cardmaker.videoSeconds';
function savedSeconds(): number {
  try {
    const v = Number(localStorage.getItem(DUR_KEY));
    return (DURATIONS as readonly number[]).includes(v) ? v : 60;
  } catch {
    return 60;
  }
}

/** Не даём экрану телефона погаснуть, пока пишется видео (иначе запись остановится). */
async function keepScreenOn(): Promise<() => void> {
  try {
    const lock = await navigator.wakeLock?.request('screen');
    return () => void lock?.release().catch(() => {});
  } catch {
    return () => {};
  }
}

export function SendBar({ card }: { card: CardState }) {
  const { t } = useI18n();
  const [seconds, setSecondsState] = useState(savedSeconds);
  const setSeconds = (s: number) => {
    setSecondsState(s);
    try {
      localStorage.setItem(DUR_KEY, String(s));
    } catch {
      /* приватный режим — просто не запомним */
    }
  };
  const abort = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [sheet, setSheet] = useState(false);
  /** Готовое видео ждёт второго нажатия: share() разрешён только сразу после жеста пользователя. */
  const [readyVideo, setReadyVideo] = useState<Blob | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  /** null — запись отменили. */
  const makeVideo = async (): Promise<Blob | null> => {
    if (!canRecordVideo()) {
      flash(t.ui.noVideo);
      return exportPNG(card);
    }
    abort.current = new AbortController();
    const release = await keepScreenOn();
    setProgress(0);
    try {
      return await exportVideo(card, seconds, setProgress, abort.current.signal);
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return null;
      throw e;
    } finally {
      release();
      setProgress(null);
      abort.current = null;
    }
  };

  const shareBlob = async (blob: Blob) => {
    const res = await shareOrDownload(blob, `card.${extFor(blob)}`, t.appName);
    if (res !== 'cancelled') flash(res === 'shared' ? t.ui.shared : t.ui.downloaded);
  };

  const send = async (kind: 'image' | 'video') => {
    setSheet(false);
    if (kind === 'image') {
      // Картинка со спецэффектами готовится до секунды — если долго, тоже просим второе нажатие
      const t0 = performance.now();
      const blob = await exportPNG(card);
      return performance.now() - t0 > 600 ? setReadyVideo(blob) : shareBlob(blob);
    }
    // Запись длится секунды — к её концу «разрешение от нажатия» истекает,
    // поэтому показываем кнопку «Отправить» для нового нажатия.
    const blob = await makeVideo();
    if (!blob) return;
    if (blob.type.startsWith('video/')) setReadyVideo(blob);
    else shareBlob(blob);
  };

  const save = async (kind: 'image' | 'video') => {
    const blob = kind === 'video' ? await makeVideo() : await exportPNG(card);
    if (!blob) return;
    download(blob, `card.${extFor(blob)}`);
    flash(t.ui.downloaded);
  };

  const copy = async () => {
    if (await copyImage(await exportPNG(card))) flash(t.ui.copied);
  };

  return (
    <>
      <div className="send-bar">
        <button className="primary" onClick={() => (hasMotion(card) ? setSheet(true) : send('image'))}>
          📤 {t.ui.share}
        </button>
        <button onClick={() => save('image')}>🖼️ {t.ui.savePng}</button>
        <button onClick={() => save('video')} disabled={!hasMotion(card)}>
          🎬 {t.ui.saveVideo}
        </button>
        {'ClipboardItem' in window && <button onClick={copy}>📋 {t.ui.copy}</button>}
      </div>
      {hasMotion(card) && (
        <div className="duration-row" role="radiogroup" aria-label={t.ui.videoLength}>
          <span>⏱ {t.ui.videoLength}:</span>
          {DURATIONS.map((s) => (
            <button key={s} role="radio" aria-checked={seconds === s} className={`chip ${seconds === s ? 'active' : ''}`} onClick={() => setSeconds(s)}>
              {s === 60 ? t.ui.oneMinute : `${s} ${t.ui.sec}`}
            </button>
          ))}
        </div>
      )}

      {sheet && (
        <div className="sheet-backdrop" onClick={() => setSheet(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>{t.ui.sendTitle}</h3>
            <button className="big-action" onClick={() => send('video')}>
              🎬 {t.ui.asVideo}
            </button>
            <button className="big-action secondary" onClick={() => send('image')}>
              🖼️ {t.ui.asImage}
            </button>
          </div>
        </div>
      )}

      {readyVideo && (
        <div className="sheet-backdrop" onClick={() => setReadyVideo(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>✅ {readyVideo.type.startsWith('video/') ? t.ui.videoReady : t.ui.imageReady}</h3>
            <button
              className="big-action"
              onClick={() => {
                const blob = readyVideo;
                setReadyVideo(null);
                shareBlob(blob);
              }}
            >
              📤 {t.ui.share}
            </button>
            <button
              className="big-action secondary"
              onClick={() => {
                download(readyVideo, `card.${extFor(readyVideo)}`);
                setReadyVideo(null);
                flash(t.ui.downloaded);
              }}
            >
              💾 {t.ui.saveFile}
            </button>
          </div>
        </div>
      )}

      {progress !== null && (
        <div className="sheet-backdrop">
          <div className="sheet">
            <h3>{t.ui.recording}</h3>
            <div className="progress">
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="hint">
              {t.ui.timeLeft.replace('{s}', String(Math.max(0, Math.ceil(seconds * (1 - progress)))))} · {t.ui.keepScreen}
            </p>
            <button className="big-action secondary" onClick={() => abort.current?.abort()}>
              ✖ {t.ui.cancel}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

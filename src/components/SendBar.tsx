import { useState } from 'react';
import type { CardState } from '../types';
import { useI18n } from '../i18n/I18nProvider';
import { canRecordVideo, copyImage, download, exportPNG, exportVideo, extFor, shareOrDownload } from '../engine/export';

const hasMotion = (c: CardState) => c.animation !== 'none' || c.text.anim !== 'none';

export function SendBar({ card }: { card: CardState }) {
  const { t } = useI18n();
  const [progress, setProgress] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [sheet, setSheet] = useState(false);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const makeVideo = async () => {
    if (!canRecordVideo()) {
      flash(t.ui.noVideo);
      return exportPNG(card);
    }
    setProgress(0);
    try {
      return await exportVideo(card, 5, setProgress);
    } finally {
      setProgress(null);
    }
  };

  const send = async (kind: 'image' | 'video') => {
    setSheet(false);
    const blob = kind === 'video' ? await makeVideo() : await exportPNG(card);
    const res = await shareOrDownload(blob, `card.${extFor(blob)}`, t.appName);
    if (res !== 'cancelled') flash(res === 'shared' ? t.ui.shared : t.ui.downloaded);
  };

  const save = async (kind: 'image' | 'video') => {
    const blob = kind === 'video' ? await makeVideo() : await exportPNG(card);
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

      {progress !== null && (
        <div className="sheet-backdrop">
          <div className="sheet">
            <h3>{t.ui.recording}</h3>
            <div className="progress">
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

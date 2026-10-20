import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { fmtTime } from '../engine/jamendo';

interface Props {
  blob: Blob;
  onSend: () => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * Предпросмотр готового файла перед отправкой: показываем ровно то, что получит адресат.
 * Кнопки здесь — новое нажатие пользователя, поэтому системное «Поделиться» всегда откроется.
 */
export function PreviewSheet({ blob, onSend, onSave, onClose }: Props) {
  const { t } = useI18n();
  const isVideo = blob.type.startsWith('video/');
  const video = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  // Ссылка на файл живёт ровно столько, сколько открыт предпросмотр
  // (создаём и освобождаем в одном эффекте — корректно и при повторном монтировании)
  const [url, setUrl] = useState('');
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  // Пробуем играть со звуком; если браузер не разрешил — без звука (звук включается на панели видео)
  useEffect(() => {
    const v = video.current;
    if (!v || !url) return;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, [url]);

  // Закрытие по Esc на компьютере
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sizeMb = (blob.size / 1048576).toFixed(1);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet preview-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.ui.previewTitle}>
        <h3>👀 {t.ui.previewTitle}</h3>
        <div className="preview-media">
          {!url ? null : isVideo ? (
            <video
              ref={video}
              src={url}
              controls
              playsInline
              loop
              onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
            />
          ) : (
            <img src={url} alt={t.ui.previewTitle} />
          )}
        </div>
        <p className="hint preview-info">
          {isVideo ? `🎬 ${t.ui.saveVideo}${duration ? ` · ${fmtTime(Math.round(duration))}` : ''}` : `🖼️ ${t.ui.savePng}`} · {sizeMb} MB
        </p>
        <button className="big-action" onClick={onSend}>
          📤 {t.ui.share}
        </button>
        <div className="preview-actions">
          <button className="big-action secondary" onClick={onSave}>
            💾 {t.ui.saveFile}
          </button>
          <button className="big-action secondary" onClick={onClose}>
            ✏️ {t.ui.edit}
          </button>
        </div>
      </div>
    </div>
  );
}

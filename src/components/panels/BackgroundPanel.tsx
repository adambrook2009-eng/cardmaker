import { useRef, useState } from 'react';
import type { CardApi, PhotosBackground } from '../../state/useCard';
import type { SlideTransition } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { BACKGROUND_IDS } from '../../engine/backgrounds';
import { drawBackground } from '../../engine/renderer';
import { Thumb } from '../Thumb';

/** Для слайд-шоу фото уменьшаем сильнее: 20 снимков в памяти телефона — это много. */
const MAX_PHOTO = 1400;
const MAX_PHOTOS = 20;
const SLIDE_SECONDS = [3, 5, 8];
const TRANSITIONS: { id: SlideTransition; icon: string }[] = [
  { id: 'fade', icon: '🌫️' },
  { id: 'slide', icon: '➡️' },
  { id: 'zoom', icon: '🔍' },
];

/** Загружаем фото и сразу уменьшаем — анимация останется плавной даже на слабых телефонах. */
function loadPhoto(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_PHOTO / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

const one = (img: HTMLCanvasElement): PhotosBackground => ({ kind: 'photos', imgs: [img], slideSec: 5, transition: 'fade' });

export function BackgroundPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const bg = api.card.background;
  // свои фото: текущие или сохранённые (если сейчас выбран готовый фон)
  const photos: PhotosBackground | null = bg.kind === 'photos' ? bg : api.photoBg;
  const photosActive = bg.kind === 'photos';

  const update = (p: Partial<PhotosBackground>) => photos && api.setPhotos({ ...photos, ...p });

  const addFiles = async (files: FileList) => {
    const list = [...files].filter((f) => f.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));
    const room = MAX_PHOTOS - (photos?.imgs.length ?? 0);
    const take = list.slice(0, Math.max(0, room));
    const imgs: HTMLCanvasElement[] = [];
    for (let i = 0; i < take.length; i++) {
      setLoading(`${i + 1}/${take.length}`);
      try {
        imgs.push(await loadPhoto(take[i]));
      } catch {
        /* не картинка или формат не поддерживается — пропускаем */
      }
    }
    setLoading(null);
    if (!imgs.length) return;
    api.setPhotos(photos ? { ...photos, imgs: [...photos.imgs, ...imgs] } : { ...one(imgs[0]), imgs });
    if (list.length > take.length) alert(t.ui.photosLimit.replace('{n}', String(MAX_PHOTOS)));
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!photos) return;
    const imgs = [...photos.imgs];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    update({ imgs });
  };

  const remove = (i: number) => {
    if (!photos) return;
    const imgs = photos.imgs.filter((_, k) => k !== i);
    api.setPhotos(imgs.length ? { ...photos, imgs } : null);
  };

  const count = photos?.imgs.length ?? 0;

  return (
    <div className="panel">
      <button className="big-action" onClick={() => input.current?.click()} disabled={!!loading}>
        {loading ? `⏳ ${t.ui.photosLoading} ${loading}` : `📷 ${count ? t.ui.addPhotos : t.ui.uploadPhotos}`}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          if (e.target.files?.length) await addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {photos && (
        <div className={`photo-box ${photosActive ? '' : 'inactive'}`}>
          <h3>
            🖼️ {t.ui.myPhotos} · {count}
          </h3>
          <div className="photo-strip">
            {photos.imgs.map((img, i) => (
              <div key={i} className="photo-item">
                <Thumb draw={(ctx) => drawBackground(ctx, { background: one(img) }, 'none')} deps={[img]} />
                <span className="photo-num">{i + 1}</span>
                <div className="photo-tools">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="←">
                    ◀
                  </button>
                  <button onClick={() => remove(i)} aria-label={t.ui.remove}>
                    ✕
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === count - 1} aria-label="→">
                    ▶
                  </button>
                </div>
              </div>
            ))}
            {count < MAX_PHOTOS && (
              <button className="photo-add" onClick={() => input.current?.click()} aria-label={t.ui.addPhotos}>
                ＋
              </button>
            )}
          </div>

          {!photosActive && (
            <button className="big-action secondary" onClick={() => api.setPhotos(photos)}>
              ↩ {t.ui.usePhotos}
            </button>
          )}

          {photosActive && count > 1 && (
            <>
              <h3>⏱ {t.ui.slideEvery}</h3>
              <div className="chips">
                {SLIDE_SECONDS.map((s) => (
                  <button key={s} className={`chip ${photos.slideSec === s ? 'active' : ''}`} onClick={() => update({ slideSec: s })}>
                    {s} {t.ui.sec}
                  </button>
                ))}
              </div>
              <h3>✨ {t.ui.slideTransition}</h3>
              <div className="chips">
                {TRANSITIONS.map((tr) => (
                  <button key={tr.id} className={`chip ${photos.transition === tr.id ? 'active' : ''}`} onClick={() => update({ transition: tr.id })}>
                    {tr.icon} {t.ui.transitions[tr.id]}
                  </button>
                ))}
              </div>
              <p className="hint">{t.ui.slideshowHint.replace('{n}', String(count)).replace('{s}', String(count * photos.slideSec))}</p>
            </>
          )}
        </div>
      )}

      <h3>{t.ui.builtin}</h3>
      <div className="thumb-grid">
        {BACKGROUND_IDS.map((id) => (
          <button
            key={id}
            className={`thumb-btn ${bg.kind === 'builtin' && bg.id === id ? 'active' : ''}`}
            onClick={() => api.patch({ background: { kind: 'builtin', id } })}
          >
            <Thumb draw={(ctx) => drawBackground(ctx, { background: { kind: 'builtin', id } }, 'none')} deps={[id]} />
          </button>
        ))}
      </div>
    </div>
  );
}

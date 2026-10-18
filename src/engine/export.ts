import type { CardState } from '../types';
import { createAnimation } from './animations';
import { getAudioContext, startMusic } from './audio';
import { renderScene } from './renderer';
import { SIZE } from './utils';

function offscreen() {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  return c;
}

/** Статичная открытка (кадр анимации на 1.5 c — когда частицы уже «разлетелись»). */
export async function exportPNG(state: CardState): Promise<Blob> {
  const c = offscreen();
  renderScene(c.getContext('2d')!, state, 1.5, createAnimation(state.animation));
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
}

export const canRecordVideo = () => typeof MediaRecorder !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype;

function pickMime(withAudio: boolean): string {
  // MP4 — Safari/iOS и новый Chrome; WebM — остальные
  const list = withAudio
    ? ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    : ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
  return list.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
}

/** Анимированная открытка: записываем холст в видео (без серверов и ffmpeg). */
export async function exportVideo(state: CardState, seconds = 5, onProgress?: (p: number) => void): Promise<Blob> {
  const c = offscreen();
  const ctx = c.getContext('2d')!;
  const anim = createAnimation(state.animation);
  const tracks: MediaStreamTrack[] = c.captureStream(30).getVideoTracks();

  // Музыка: синтезатор/файл играет в поток, который записывается вместе с картинкой
  let stopMusic = () => {};
  if (state.music.kind !== 'none') {
    const ac = getAudioContext();
    const dest = ac.createMediaStreamDestination();
    stopMusic = startMusic(state.music, ac, dest, { duration: seconds });
    tracks.push(...dest.stream.getAudioTracks());
  }
  const stream = new MediaStream(tracks);
  const mimeType = pickMime(tracks.length > 1);
  const rec = new MediaRecorder(stream, { mimeType: mimeType || undefined, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  // Тип без параметров кодека («video/mp4», не «video/mp4;codecs=avc1») — иначе
  // системное «Поделиться» и мессенджеры на части телефонов отклоняют файл.
  const baseType = (rec.mimeType || mimeType || 'video/webm').split(';')[0];
  const done = new Promise<Blob>((res) => (rec.onstop = () => res(new Blob(chunks, { type: baseType }))));

  rec.start(250);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      renderScene(ctx, state, t, anim);
      onProgress?.(Math.min(1, t / seconds));
      if (t < seconds) requestAnimationFrame(tick);
      else resolve();
    };
    tick();
  });
  rec.stop();
  stopMusic();
  return done;
}

export const extFor = (blob: Blob) => (blob.type.includes('mp4') ? 'mp4' : blob.type.includes('webm') ? 'webm' : 'png');

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Отправка: системное меню «Поделиться» (WhatsApp, Telegram, почта…) на телефонах
 * и в современных десктоп-браузерах; если его нет — скачивание файла.
 */
export async function shareOrDownload(blob: Blob, name: string, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], name, { type: blob.type.split(';')[0] });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelled';
    }
  }
  download(blob, name);
  return 'downloaded';
}

export async function copyImage(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return true;
  } catch {
    return false;
  }
}

/**
 * ИИ-редактор: меняет на фото то, что написал пользователь («надень на него костюм», «сделай короткую стрижку»).
 * Работает через Google Gemini («Nano Banana») с ключом самого пользователя: ключ хранится только
 * на этом устройстве, фото отправляется в Google лишь после согласия. Это платно (~3–5 центов за картинку).
 */

const KEY_STORE = 'cardmaker.geminiKey';
const MODEL_STORE = 'cardmaker.geminiModel';
const API = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Сначала основная модель; если её нет (404) — пробуем следующие. Рабочую запоминаем. */
const MODELS = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
const MAX_SIDE = 1024;

export class AiKeyError extends Error {}
export class AiQuotaError extends Error {}
export class AiBlockedError extends Error {}
export class AiNetworkError extends Error {}

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      /* приватный режим — ключ проживёт до закрытия вкладки */
    }
  },
};
let memoryKey: string | null = null;

export const getAiKey = () => memoryKey ?? store.get(KEY_STORE);
export function setAiKey(key: string | null) {
  memoryKey = key?.trim() || null;
  store.set(KEY_STORE, memoryKey);
}

/** Фото → JPEG base64 (уменьшенное: быстрее и дешевле). */
function toBase64(photo: HTMLCanvasElement) {
  const k = Math.min(1, MAX_SIDE / Math.max(photo.width, photo.height));
  const c = document.createElement('canvas');
  c.width = Math.round(photo.width * k);
  c.height = Math.round(photo.height * k);
  const g = c.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(photo, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.9).split(',')[1];
}

function fromBase64(data: string, mime: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      resolve(c);
    };
    img.onerror = () => reject(new AiBlockedError('bad image'));
    img.src = `data:${mime};base64,${data}`;
  });
}

type Part = { text?: string; thought?: boolean; inlineData?: { data: string; mimeType: string }; inline_data?: { data: string; mime_type: string } };

async function callModel(model: string, key: string, body: unknown, signal: AbortSignal) {
  return fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
    signal,
  });
}

/** Изменить фото по словам пользователя. Возвращает новое фото. */
export async function aiEdit(photo: HTMLCanvasElement, instruction: string): Promise<HTMLCanvasElement> {
  const key = getAiKey();
  if (!key) throw new AiKeyError('no key');
  const prompt =
    `Edit this photo as requested: "${instruction}". ` +
    'Change only what is requested. Keep the same people (faces and identity), their pose, the framing, the background and the lighting. ' +
    'The result must look like a real, natural photo.';
  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: toBase64(photo) } }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  };
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 120000);
  try {
    const saved = store.get(MODEL_STORE);
    const order = saved && MODELS.includes(saved) ? [saved, ...MODELS.filter((m) => m !== saved)] : MODELS;
    let res: Response | null = null;
    for (const model of order) {
      try {
        res = await callModel(model, key, body, ctl.signal);
      } catch {
        throw new AiNetworkError('fetch');
      }
      if (res.status !== 404) {
        if (res.ok) store.set(MODEL_STORE, model);
        break;
      }
    }
    if (!res) throw new AiNetworkError('no response');
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 429 || /RESOURCE_EXHAUSTED|quota|billing/i.test(text)) throw new AiQuotaError(text);
      if (res.status === 400 && /API_KEY|api key/i.test(text)) throw new AiKeyError(text);
      if (res.status === 401 || res.status === 403) throw new AiKeyError(text);
      if (res.status === 400 && /SAFETY|blocked|PROHIBITED/i.test(text)) throw new AiBlockedError(text);
      throw new AiNetworkError(`${res.status} ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const parts: Part[] = data.candidates?.[0]?.content?.parts ?? [];
    // промежуточные «черновые» картинки (thought) пропускаем — берём последнюю итоговую
    const img = parts.filter((p) => !p.thought && (p.inlineData || p.inline_data)).pop();
    if (!img) throw new AiBlockedError(data.candidates?.[0]?.finishReason ?? 'no image');
    const inline = img.inlineData ?? { data: img.inline_data!.data, mimeType: img.inline_data!.mime_type };
    return await fromBase64(inline.data, inline.mimeType || 'image/png');
  } catch (e) {
    if (ctl.signal.aborted) throw new AiNetworkError('timeout');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * ИИ-редактор: меняет на фото то, что написал пользователь («надень на него костюм», «сделай короткую стрижку»).
 * Цепочка, чтобы бесплатных правок было как можно больше:
 *  1) Hugging Face — нейросеть FLUX.1 Kontext (Black Forest Labs) в бесплатном Space: без регистрации,
 *     у каждого пользователя свой дневной лимит GPU;
 *  2) дневной лимит кончился — Puter.js (Google Gemini «Nano Banana»): бесплатный аккаунт Puter, месячный лимит;
 *  3) если пользователь ввёл свой ключ Google — сразу Gemini по ключу (платно, ~3–5 центов за картинку).
 * Фото отправляется только после согласия пользователя.
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
/** Пользователь закрыл окно входа в Puter. */
export class AiCancelledError extends Error {}

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

const promptFor = (instruction: string) =>
  `Edit this photo as requested: "${instruction}". ` +
  'Change only what is requested. Keep the same people (faces and identity), their pose, the framing, the background and the lighting. ' +
  'The result must look like a real, natural photo.';

/* ---------- Перевод просьбы на английский (FLUX понимает только английский) ---------- */

async function toEnglish(text: string): Promise<string> {
  if (!/[^\x00-\x7f]/.test(text)) return text; // уже по-английски
  const src = /[֐-׿]/.test(text) ? 'he' : /[Ѐ-ӿ]/.test(text) ? 'ru' : 'auto';
  const tries: (() => Promise<string>)[] = [
    async () => {
      const r = await fetch(`https://api.mymemory.translated.net/get?${new URLSearchParams({ q: text, langpair: `${src === 'auto' ? 'ru' : src}|en` })}`);
      const t = (await r.json())?.responseData?.translatedText as string | undefined;
      if (!r.ok || !t || /MYMEMORY WARNING|QUERY LENGTH/i.test(t)) throw new Error('mymemory');
      return t;
    },
    async () => {
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?${new URLSearchParams({ client: 'gtx', sl: src, tl: 'en', dt: 't', q: text })}`);
      const j = await r.json();
      const t = (j?.[0] ?? []).map((x: [string]) => x[0]).join('');
      if (!t) throw new Error('gtx');
      return t;
    },
  ];
  for (const f of tries) {
    try {
      return await f();
    } catch {
      /* следующий переводчик */
    }
  }
  return text; // переводчики недоступны — отправим как есть
}

/* ---------- Бесплатно №1: Hugging Face (FLUX.1 Kontext) ---------- */

const HF_SPACE = 'https://black-forest-labs-flux-1-kontext-dev.hf.space';
/** Дневной лимит GPU на Hugging Face кончился (или Space недоступен) — переходим к Puter. */
class HfUnavailable extends Error {}

async function hfEdit(photo: HTMLCanvasElement, instruction: string, signal: AbortSignal): Promise<HTMLCanvasElement> {
  const en = await toEnglish(instruction);
  const prompt = `${en}. Keep the person's face, identity, pose, and the background unchanged. Realistic photo.`;
  const small = document.createElement('canvas');
  const k = Math.min(1, MAX_SIDE / Math.max(photo.width, photo.height));
  small.width = Math.round(photo.width * k);
  small.height = Math.round(photo.height * k);
  small.getContext('2d')!.drawImage(photo, 0, 0, small.width, small.height);
  const blob = await new Promise<Blob | null>((r) => small.toBlob(r, 'image/jpeg', 0.92));
  if (!blob) throw new HfUnavailable('blob');
  try {
    // 1) загрузить фото в Space
    const fd = new FormData();
    fd.append('files', blob, 'photo.jpg');
    const up = await fetch(`${HF_SPACE}/gradio_api/upload`, { method: 'POST', body: fd, signal });
    if (!up.ok) throw new HfUnavailable(`upload ${up.status}`);
    const [path] = (await up.json()) as string[];
    const file = { path, meta: { _type: 'gradio.FileData' }, orig_name: 'photo.jpg', mime_type: 'image/jpeg' };
    // 2) поставить задачу: фото, просьба, seed, случайный seed, guidance, шаги
    const start = await fetch(`${HF_SPACE}/gradio_api/call/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [file, prompt, 0, true, 2.5, 28] }),
      signal,
    });
    if (!start.ok) throw new HfUnavailable(`call ${start.status}`);
    const { event_id } = await start.json();
    // 3) дождаться результата (ответ приходит потоком событий; ждём «complete» или «error»)
    const sse = await (await fetch(`${HF_SPACE}/gradio_api/call/infer/${event_id}`, { signal })).text();
    const done = /event: complete\ndata: (.*)/.exec(sse);
    if (!done) {
      const err = /event: error\ndata: (.*)/.exec(sse)?.[1] ?? '';
      if (/nsfw|safety|inappropriate/i.test(err)) throw new AiBlockedError(err);
      throw new HfUnavailable(err || 'no result'); // чаще всего — кончился дневной лимит GPU
    }
    const url = JSON.parse(done[1])?.[0]?.url as string | undefined;
    if (!url) throw new HfUnavailable('no url');
    const bmp = await createImageBitmap(await (await fetch(url, { signal })).blob());
    const out = document.createElement('canvas');
    out.width = bmp.width;
    out.height = bmp.height;
    out.getContext('2d')!.drawImage(bmp, 0, 0);
    return out;
  } catch (e) {
    if (e instanceof AiBlockedError || e instanceof HfUnavailable) throw e;
    throw new HfUnavailable(String(e));
  }
}

/* ---------- Бесплатно №2: Puter.js ---------- */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Puter = any;
const PUTER_SRC = 'https://js.puter.com/v2/';
const PUTER_MODELS = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image'];
let puterLoading: Promise<Puter> | null = null;

/** Загрузить Puter.js (только когда понадобился ИИ — остальным пользователям он не грузится). */
export function loadPuter(): Promise<Puter> {
  const w = window as any;
  if (w.puter) return Promise.resolve(w.puter);
  if (!puterLoading) {
    puterLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PUTER_SRC;
      s.async = true;
      s.onload = () => (w.puter ? resolve(w.puter) : reject(new AiNetworkError('puter')));
      s.onerror = () => {
        puterLoading = null;
        s.remove();
        reject(new AiNetworkError('puter'));
      };
      document.head.appendChild(s);
    });
  }
  return puterLoading;
}

/** Картинка-ответ Puter → наш холст (через blob, чтобы холст не стал «закрытым» для сохранения). */
async function imageToCanvas(img: HTMLImageElement): Promise<HTMLCanvasElement> {
  let source: CanvasImageSource = img;
  if (!img.src.startsWith('data:')) {
    const blob = await (await fetch(img.src)).blob();
    source = await createImageBitmap(blob);
  } else if (!img.complete) await img.decode();
  const c = document.createElement('canvas');
  c.width = (source as HTMLImageElement).naturalWidth || (source as ImageBitmap).width;
  c.height = (source as HTMLImageElement).naturalHeight || (source as ImageBitmap).height;
  c.getContext('2d')!.drawImage(source, 0, 0);
  return c;
}

async function puterEdit(photo: HTMLCanvasElement, instruction: string): Promise<HTMLCanvasElement> {
  // если пользователь ещё не вошёл, Puter сам покажет окно «Continue» → вход или бесплатная регистрация
  const puter = await loadPuter();
  const data = toBase64(photo);
  let lastErr: unknown = null;
  for (const model of PUTER_MODELS) {
    try {
      const img: HTMLImageElement = await puter.ai.txt2img(promptFor(instruction), {
        model,
        input_image: data,
        input_image_mime_type: 'image/jpeg',
      });
      try {
        return await imageToCanvas(img);
      } catch {
        throw new AiNetworkError('result');
      }
    } catch (e: any) {
      if (e instanceof AiNetworkError) throw e;
      lastErr = e;
      // ошибки Puter бывают { code, message } или { error: { code, message } }
      const code = [e?.code, e?.errorCode, e?.message, e?.error?.code, e?.error?.message, typeof e === 'string' ? e : ''].filter(Boolean).join(' ');
      if (/insufficient_funds|402|credit|balance/i.test(code)) throw new AiQuotaError(code);
      if (/moderation|safety|blocked/i.test(code)) throw new AiBlockedError(code);
      if (/too_many|429|rate/i.test(code)) throw new AiQuotaError(code);
      if (/auth|sign|cancel/i.test(code)) throw new AiCancelledError(code);
      if (!/model|not.?found|unknown|unsupported/i.test(code)) break; // другая модель тут не поможет
    }
  }
  throw new AiNetworkError(String((lastErr as any)?.message ?? lastErr));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Изменить фото по словам пользователя. Возвращает новое фото. */
export async function aiEdit(photo: HTMLCanvasElement, instruction: string): Promise<HTMLCanvasElement> {
  const key = getAiKey();
  if (!key) {
    // без своего ключа: сначала Hugging Face (без регистрации), если лимит кончился — Puter
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 240000); // очередь на бесплатный GPU бывает длинной
    try {
      return await hfEdit(photo, instruction, ctl.signal);
    } catch (e) {
      if (e instanceof AiBlockedError) throw e;
    } finally {
      clearTimeout(timer);
    }
    return puterEdit(photo, instruction);
  }
  const prompt = promptFor(instruction);
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

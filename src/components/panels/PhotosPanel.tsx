import { useRef, useState } from 'react';
import type { CardApi, PhotosBackground } from '../../state/useCard';
import type { SlideTransition } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { drawBackground } from '../../engine/renderer';
import { parseCommands, runCommands, type LogEntry } from '../../engine/photoEdit';
import { getAiKey, setAiKey } from '../../engine/aiEdit';
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

/** Вкладка «Фото»: добавить, выбрать, изменить и объединить свои фото. */
export function PhotosPanel({ api }: { api: CardApi }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]); // номера отмеченных фото (с 1)
  const [command, setCommand] = useState('');
  const [log, setLog] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState<'edit' | 'swap' | 'look' | 'ai' | null>(null);
  const [aiKey, setAiKeyState] = useState(() => getAiKey());
  const [aiOpen, setAiOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const history = useRef<HTMLCanvasElement[][]>([]); // для «Отменить»
  const bg = api.card.background;
  // свои фото: текущие или сохранённые (если сейчас выбран готовый фон)
  const photos: PhotosBackground | null = bg.kind === 'photos' ? bg : api.photoBg;
  const photosActive = bg.kind === 'photos';
  const count = photos?.imgs.length ?? 0;

  const update = (p: Partial<PhotosBackground>) => photos && api.setPhotos({ ...photos, ...p });
  const setImgs = (imgs: HTMLCanvasElement[]) => {
    if (photos) history.current.push(photos.imgs);
    api.setPhotos(imgs.length ? { ...(photos ?? one(imgs[0])), imgs } : null);
  };

  const addFiles = async (files: FileList) => {
    const list = [...files].filter((f) => f.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));
    const take = list.slice(0, Math.max(0, MAX_PHOTOS - count));
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
    if (imgs.length) setImgs([...(photos?.imgs ?? []), ...imgs]);
    if (list.length > take.length) alert(t.ui.photosLimit.replace('{n}', String(MAX_PHOTOS)));
  };

  const toggle = (n: number) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n].sort((a, b) => a - b)));

  /** Кнопка-подсказка дописывает команду: «номера отмеченных фото + действие». */
  const addHint = (word: string) => {
    const nums = selected.join(' ');
    // «человек на другой фон»: нужны два номера — с человеком и с фоном
    const clause =
      word === t.ui.hintSwap
        ? t.ui.swapTemplate.replace('{a}', String(selected[0] ?? 1)).replace('{b}', String(selected[1] ?? 2))
        : word === t.ui.hintBgAsk
          ? t.ui.bgTemplate.replace('{a}', nums || '1') // пользователь допишет или поменяет, какой фон хочет
          : `${nums ? nums + ' ' : ''}${word}`;
    setCommand((c) => (c.trim() ? `${c.trim().replace(/;$/, '')}; ${clause}` : clause));
  };

  const OK_KINDS: LogEntry['kind'][] = ['done', 'merged', 'deleted', 'swapped', 'bgReplaced', 'looked', 'aiDone'];

  /** «Сделать это»: разбираем текст и выполняем по очереди (замена фона — пару секунд). */
  const doIt = async () => {
    if (!photos || !command.trim() || busy) return;
    let cmds = parseCommands(command, count, selected);
    if (cmds.some((c) => c.ai) && aiKey) {
      // фото уходит в Google — спрашиваем один раз за сеанс
      let agreed = false;
      try {
        agreed = sessionStorage.getItem('cardmaker.aiConsent') === '1';
      } catch {
        /* нет хранилища — спросим */
      }
      if (!agreed) {
        agreed = confirm(t.ui.aiConfirm);
        if (agreed)
          try {
            sessionStorage.setItem('cardmaker.aiConsent', '1');
          } catch {
            /* ок */
          }
      }
      if (!agreed) cmds = cmds.map((c) => ({ ...c, ai: undefined }));
    }
    setBusy(cmds.some((c) => c.ai && aiKey) ? 'ai' : cmds.some((c) => c.swap || c.bgDesc) ? 'swap' : cmds.some((c) => c.look) ? 'look' : 'edit');
    try {
      const res = await runCommands(photos.imgs, cmds);
      if (res.log.some((l) => OK_KINDS.includes(l.kind))) setImgs(res.imgs);
      setLog(res.log);
      // ИИ нужен, но не подключён (или ключ неверный) — сразу показываем, как подключить
      if (res.log.some((l) => l.kind === 'aiNoKey' || (l.kind === 'aiError' && l.reason === 'key'))) setAiOpen(true);
      if (res.log.every((l) => OK_KINDS.includes(l.kind))) {
        setCommand('');
        setSelected([]);
      }
    } finally {
      setBusy(null);
    }
  };

  const undo = () => {
    const prev = history.current.pop();
    if (!prev || !photos) return;
    api.setPhotos(prev.length ? { ...photos, imgs: prev } : null);
    setLog([]);
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!photos) return;
    const imgs = [...photos.imgs];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    setImgs(imgs);
  };

  /** Понятный отчёт о каждой команде. */
  const describe = (l: LogEntry): [boolean, string] => {
    const n = (a: number[]) => a.join(', ');
    switch (l.kind) {
      case 'done':
        return [true, t.ui.peDone.replace('{n}', n(l.nums)).replace('{what}', l.ops.map((o) => t.photoOps[o]).join(', '))];
      case 'merged':
        return [true, t.ui.peMerged.replace('{n}', n(l.nums)).replace('{mode}', t.mergeModes[l.mode]).replace('{r}', String(l.result))];
      case 'deleted':
        return [true, t.ui.peDeleted.replace('{n}', n(l.nums))];
      case 'noNumber':
        return [false, t.ui.peNoNumber.replace('{c}', l.text)];
      case 'badNumber':
        return [false, t.ui.peBadNumber.replace('{n}', n(l.nums)).replace('{count}', String(l.count))];
      case 'needTwo':
        return [false, t.ui.peNeedTwo];
      case 'swapped':
        return [true, t.ui.peSwapped.replace('{p}', String(l.person)).replace('{b}', String(l.bg)).replace('{r}', String(l.result))];
      case 'noPerson':
        return [false, t.ui.peNoPerson.replace('{p}', String(l.person))];
      case 'modelError':
        return [false, t.ui.peModelError];
      case 'bgReplaced':
        return [
          true,
          t.ui.peBgReplaced
            .replace('{p}', String(l.photo))
            .replace('{d}', l.look ? t.ui.bgLooks[l.look] : `«${l.desc}»`)
            .replace('{r}', String(l.result)) +
            (l.credit ? ` (${t.ui.peBgCredit} ${l.credit})` : ''),
        ];
      case 'bgNotFound':
        return [false, t.ui.peBgNotFound.replace('{d}', l.desc)];
      case 'netError':
        return [false, t.ui.peNetError];
      case 'looked': {
        const { part, color, pattern, tone } = l.look;
        const what = [color && t.ui.lookNewColor, pattern && t.ui.lookPatterns[pattern], tone && t.ui.lookTones[tone]].filter(Boolean).join(', ');
        return [true, t.ui.peLooked.replace('{n}', n(l.nums)).replace('{part}', t.ui.lookParts[part]).replace('{what}', what)];
      }
      case 'noPart':
        return [false, t.ui.peNoPart.replace('{part}', t.ui.lookParts[l.part]).replace('{p}', String(l.photo))];
      case 'lookUnknown':
        return [false, t.ui.peLookUnknown.replace('{part}', t.ui.lookParts[l.part])];
      case 'aiDone':
        return [true, t.ui.peAiDone.replace('{p}', String(l.photo)).replace('{c}', l.text)];
      case 'aiNoKey':
        return [false, t.ui.peAiNoKey.replace('{c}', l.text)];
      case 'aiError':
        return [false, t.ui.aiErrors[l.reason]];
      default:
        return [false, t.ui.peNotUnderstood.replace('{c}', l.text)];
    }
  };

  const HINTS: [string, string][] = [
    ['👤', t.ui.hintSwap],
    ['🏞️', t.ui.hintBgAsk],
    ['💇', t.ui.hintHair],
    ['👕', t.ui.hintClothes],
    ['🤵', t.ui.hintAiClothes],
    ['💈', t.ui.hintAiHair],
    ['⬛', t.ui.hintBw],
    ['🔄', t.ui.hintRotate],
    ['🪞', t.ui.hintFlip],
    ['✂️', t.ui.hintCrop],
    ['☀️', t.ui.hintBrighter],
    ['🔥', t.ui.hintWarm],
    ['🎨', t.ui.hintVivid],
    ['🟫', t.ui.hintSepia],
    ['⬜', t.ui.hintBorder],
    ['🧩', t.ui.hintMerge],
    ['🌫️', t.ui.hintBlend],
    ['🗑️', t.ui.hintDelete],
  ];

  return (
    <div className="panel">
      <section className={`photo-section ${photosActive ? 'active' : ''}`}>
        <h3>📷 {t.ui.photoSectionTitle}</h3>
        <button className="big-action" onClick={() => input.current?.click()} disabled={!!loading || count >= MAX_PHOTOS}>
          {loading ? `⏳ ${t.ui.photosLoading} ${loading}` : `＋ ${count ? t.ui.addPhotos : t.ui.uploadPhotos}`}
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
          <>
            <p className="hint">{t.ui.peTapHint}</p>
            <div className="photo-strip">
              {photos.imgs.map((img, i) => (
                <div key={i} className={`photo-item ${selected.includes(i + 1) ? 'selected' : ''}`}>
                  <button className="photo-pick" onClick={() => toggle(i + 1)} aria-pressed={selected.includes(i + 1)}>
                    <Thumb draw={(ctx) => drawBackground(ctx, { background: one(img) }, 'none')} deps={[img]} />
                    <span className="photo-num">{i + 1}</span>
                    {selected.includes(i + 1) && <span className="photo-check">✓</span>}
                  </button>
                  <div className="photo-tools">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="←">
                      ◀
                    </button>
                    <button onClick={() => setImgs(photos.imgs.filter((_, k) => k !== i))} aria-label={t.ui.remove}>
                      ✕
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === count - 1} aria-label="→">
                      ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* команда словами */}
            <label className="pe-label" htmlFor="pe-cmd">
              ✍️ {t.ui.peCommandLabel}
            </label>
            <textarea
              id="pe-cmd"
              className="pe-command"
              rows={2}
              dir="auto"
              value={command}
              placeholder={t.ui.pePlaceholder}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  doIt();
                }
              }}
            />
            <div className="chips pe-hints">
              {HINTS.map(([icon, word]) => (
                <button key={word} className="chip" onClick={() => addHint(word)}>
                  {icon} {word}
                </button>
              ))}
            </div>
            <div className="pe-actions">
              <button className="big-action" onClick={doIt} disabled={!command.trim() || !!busy}>
                {busy === 'swap'
                  ? `⏳ ${t.ui.peSwapping}`
                  : busy === 'look'
                    ? `⏳ ${t.ui.peLooking}`
                    : busy === 'ai'
                      ? `⏳ ${t.ui.peAiWorking}`
                      : busy
                        ? '⏳'
                        : `✨ ${t.ui.peDoIt}`}
              </button>
              <button className="big-action secondary pe-undo" onClick={undo} disabled={!history.current.length}>
                ↩ {t.ui.peUndo}
              </button>
            </div>
            {log.length > 0 && (
              <ul className="pe-log">
                {log.map((l, i) => {
                  const [ok, msg] = describe(l);
                  return (
                    <li key={i} className={ok ? 'ok' : 'err'}>
                      {ok ? '✅' : '⚠️'} {msg}
                    </li>
                  );
                })}
              </ul>
            )}
            {log.some((l) => l.kind === 'notUnderstood' || l.kind === 'aiNoKey') && <p className="hint">{t.ui.peExamples}</p>}

            {/* ИИ-редактор: одежда, причёска — что угодно своими словами */}
            <details className="ai-box" open={aiOpen} onToggle={(e) => setAiOpen((e.target as HTMLDetailsElement).open)}>
              <summary>
                🤖 {t.ui.aiTitle} {aiKey ? `· ✅ ${t.ui.aiOn}` : ''}
              </summary>
              <p className="hint">{t.ui.aiAbout}</p>
              {aiKey ? (
                <button
                  className="big-action secondary"
                  onClick={() => {
                    setAiKey(null);
                    setAiKeyState(null);
                  }}
                >
                  {t.ui.aiRemoveKey}
                </button>
              ) : (
                <>
                  <ol className="hint ai-steps">
                    <li>
                      {t.ui.aiStep1}{' '}
                      <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                        aistudio.google.com/apikey
                      </a>
                    </li>
                    <li>{t.ui.aiStep2}</li>
                    <li>{t.ui.aiStep3}</li>
                  </ol>
                  <div className="ai-key-row">
                    <input
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={t.ui.aiKeyPlaceholder}
                      value={keyDraft}
                      onChange={(e) => setKeyDraft(e.target.value)}
                    />
                    <button
                      className="big-action"
                      disabled={keyDraft.trim().length < 20}
                      onClick={() => {
                        setAiKey(keyDraft);
                        setAiKeyState(getAiKey());
                        setKeyDraft('');
                      }}
                    >
                      {t.ui.aiSaveKey}
                    </button>
                  </div>
                </>
              )}
            </details>

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
          </>
        )}
      </section>
    </div>
  );
}

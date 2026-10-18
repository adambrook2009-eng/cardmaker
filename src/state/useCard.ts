import { useCallback, useEffect, useState } from 'react';
import type { CardState, CardText, CategoryId, Lang, Selection, Sticker } from '../types';
import { getCategory } from '../data/categories';
import { PHRASES } from '../data/phrases';
import { SIZE } from '../engine/utils';

export function createCard(category: CategoryId, lang: Lang): CardState {
  const d = getCategory(category).defaults;
  return {
    category,
    background: { kind: 'builtin', id: d.background },
    filter: 'none',
    frame: d.frame,
    animation: d.animation,
    stickers: [],
    text: {
      value: PHRASES[category][lang][0],
      x: SIZE / 2,
      y: SIZE * 0.5,
      color: d.textColor,
      font: 'rubik',
      size: 84,
      anim: d.textAnim,
    },
  };
}

let uid = 0;

/** Всё состояние редактора в одном хуке — компоненты получают готовые действия. */
export function useCard(lang: Lang) {
  const [card, setCard] = useState<CardState | null>(null);
  /** Индекс выбранной готовой фразы; null — пользователь отредактировал текст сам. */
  const [phraseIdx, setPhraseIdx] = useState<number | null>(0);
  const [selection, setSelection] = useState<Selection>(null);

  const patch = useCallback((p: Partial<CardState>) => setCard((c) => (c ? { ...c, ...p } : c)), []);
  const patchText = useCallback((p: Partial<CardText>) => setCard((c) => (c ? { ...c, text: { ...c.text, ...p } } : c)), []);

  const start = useCallback(
    (category: CategoryId) => {
      setCard(createCard(category, lang));
      setPhraseIdx(0);
      setSelection(null);
    },
    [lang]
  );

  // Смена языка «на лету» переводит и выбранную фразу на открытке
  useEffect(() => {
    if (card && phraseIdx !== null) {
      const list = PHRASES[card.category][lang];
      patchText({ value: list[Math.min(phraseIdx, list.length - 1)] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const choosePhrase = (i: number) => {
    if (!card) return;
    setPhraseIdx(i);
    patchText({ value: PHRASES[card.category][lang][i] });
  };

  const setCustomText = (value: string) => {
    setPhraseIdx(null);
    patchText({ value });
  };

  const addSticker = (emoji: string) => {
    const s: Sticker = {
      id: `s${++uid}`,
      emoji,
      // небольшое случайное смещение, чтобы стикеры не ложились друг на друга
      x: SIZE / 2 + (Math.random() - 0.5) * 500,
      y: SIZE * 0.25 + (Math.random() - 0.5) * 200,
      size: 150,
    };
    setCard((c) => (c ? { ...c, stickers: [...c.stickers, s] } : c));
    setSelection({ type: 'sticker', id: s.id });
  };

  const updateSticker = (id: string, p: Partial<Sticker>) =>
    setCard((c) => (c ? { ...c, stickers: c.stickers.map((s) => (s.id === id ? { ...s, ...p } : s)) } : c));

  const removeSticker = (id: string) => {
    setCard((c) => (c ? { ...c, stickers: c.stickers.filter((s) => s.id !== id) } : c));
    setSelection(null);
  };

  const clearStickers = () => {
    patch({ stickers: [] });
    setSelection(null);
  };

  return {
    card,
    phraseIdx,
    selection,
    setSelection,
    start,
    reset: () => setCard(null),
    patch,
    patchText,
    choosePhrase,
    setCustomText,
    addSticker,
    updateSticker,
    removeSticker,
    clearStickers,
  };
}

export type CardApi = ReturnType<typeof useCard> & { card: CardState };

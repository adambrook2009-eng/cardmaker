import { useEffect, useMemo, useRef } from 'react';
import type { CardState, Selection } from '../types';
import { createAnimation } from '../engine/animations';
import { renderScene, type Box } from '../engine/renderer';
import { SIZE } from '../engine/utils';

interface Props {
  card: CardState;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onMoveSticker: (id: string, x: number, y: number) => void;
  onResizeSticker: (id: string, size: number) => void;
  onMoveText: (x: number, y: number) => void;
}

/** Живое превью открытки: цикл requestAnimationFrame + перетаскивание стикеров и текста. */
export function CardCanvas({ card, selection, onSelect, onMoveSticker, onResizeSticker, onMoveText }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textBox = useRef<Box | null>(null);
  const drag = useRef<{ dx: number; dy: number; sel: NonNullable<Selection> } | null>(null);

  // Актуальное состояние для цикла отрисовки без его перезапуска
  const live = useRef({ card, selection });
  live.current = { card, selection };

  const anim = useMemo(() => createAnimation(card.animation), [card.animation]);

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      textBox.current = renderScene(ctx, live.current.card, t, anim, live.current.selection);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [anim]);

  const toCanvas = (e: React.PointerEvent | React.WheelEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * SIZE) / r.width, y: ((e.clientY - r.top) * SIZE) / r.height };
  };

  const hitTest = (x: number, y: number): Selection => {
    // сверху вниз: последний добавленный стикер лежит выше
    for (let i = card.stickers.length - 1; i >= 0; i--) {
      const s = card.stickers[i];
      if (Math.hypot(s.x - x, s.y - y) < s.size * 0.6) return { type: 'sticker', id: s.id };
    }
    const b = textBox.current;
    if (b && x > b.x - 30 && x < b.x + b.w + 30 && y > b.y - 30 && y < b.y + b.h + 30) return { type: 'text' };
    return null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const p = toCanvas(e);
    const sel = hitTest(p.x, p.y);
    onSelect(sel);
    if (!sel) return;
    const origin = sel.type === 'text' ? card.text : card.stickers.find((s) => s.id === sel.id)!;
    drag.current = { dx: p.x - origin.x, dy: p.y - origin.y, sel };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toCanvas(e);
    const x = Math.max(0, Math.min(SIZE, p.x - d.dx));
    const y = Math.max(0, Math.min(SIZE, p.y - d.dy));
    if (d.sel.type === 'text') onMoveText(x, y);
    else onMoveSticker(d.sel.id, x, y);
  };

  const onPointerUp = () => (drag.current = null);

  // Колёсико мыши на десктопе меняет размер выбранного стикера
  const onWheel = (e: React.WheelEvent) => {
    if (selection?.type !== 'sticker') return;
    const s = card.stickers.find((st) => st.id === selection.id);
    if (s) onResizeSticker(s.id, Math.max(40, Math.min(500, s.size - Math.sign(e.deltaY) * 12)));
  };

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="card-canvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    />
  );
}

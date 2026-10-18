import { useEffect, useRef } from 'react';
import { SIZE } from '../engine/utils';

const PX = 200;

/** Маленькое превью: рисует сцену в координатах 1080×1080, масштабируя под миниатюру. */
export function Thumb({ draw, deps }: { draw: (ctx: CanvasRenderingContext2D) => void; deps: unknown[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, PX, PX);
    ctx.scale(PX / SIZE, PX / SIZE);
    draw(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return <canvas ref={ref} width={PX} height={PX} className="thumb" />;
}

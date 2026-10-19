import type { CardState } from '../types';
import { PostFX } from './post';
import { renderScene, type Box, type FrameOpts, type Layers } from './renderer';
import { SIZE } from './utils';

/**
 * Кадр = сцена (Canvas 2D) → кино-обработка (WebGL) → выходной холст.
 * Если WebGL недоступен, сцена копируется как есть — всё остальное работает.
 */
export class Pipeline {
  readonly scene = document.createElement('canvas');
  private sctx: CanvasRenderingContext2D;
  private post: PostFX | null;
  private out2d: CanvasRenderingContext2D | null = null;

  constructor(readonly out: HTMLCanvasElement, preserve = false) {
    this.scene.width = this.scene.height = SIZE;
    this.sctx = this.scene.getContext('2d')!;
    out.width = out.height = SIZE;
    this.post = PostFX.create(out, preserve);
    if (!this.post) this.out2d = out.getContext('2d');
  }

  /** postProcess=false — только сцена (для «прогрева» физики частиц перед снимком). */
  render(state: CardState, t: number, layers: Layers, opts: FrameOpts = {}, postProcess = true): Box | null {
    const box = renderScene(this.sctx, state, t, layers, opts);
    if (!postProcess) return box;
    if (this.post) this.post.render(this.scene, state.look, t, opts.level ?? 0);
    else this.out2d?.drawImage(this.scene, 0, 0);
    return box;
  }
}

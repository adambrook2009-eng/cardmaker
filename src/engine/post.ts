import type { LookId } from '../types';

/**
 * Кино-обработка на видеокарте (WebGL):
 * bloom (свечение ярких мест), цветокоррекция, хроматическая аберрация,
 * виньетка, плёночное зерно, кино-полосы. Свечение усиливается в такт музыке.
 */
interface Look {
  bloom: number;
  threshold: number;
  sat: number;
  contrast: number;
  shadow: [number, number, number];
  high: [number, number, number];
  lift: [number, number, number];
  vignette: number;
  grain: number;
  ca: number;
  bars: number;
  flicker: number;
}

const look = (p: Partial<Look>): Look => ({
  bloom: 0, threshold: 0.7, sat: 1, contrast: 1,
  shadow: [0, 0, 0], high: [0, 0, 0], lift: [0, 0, 0],
  vignette: 0, grain: 0, ca: 0, bars: 0, flicker: 0, ...p,
});

export const LOOKS: Record<LookId, Look> = {
  none: look({}),
  glow: look({ bloom: 1.1, threshold: 0.62, sat: 1.12, contrast: 1.05, vignette: 0.3, grain: 0.015 }),
  // «голливудский» teal & orange: холодные тени, тёплые света
  cinema: look({ bloom: 0.55, threshold: 0.72, sat: 0.95, contrast: 1.18, shadow: [-0.02, 0.03, 0.06], high: [0.06, 0.03, -0.03], vignette: 0.5, grain: 0.045, ca: 0.0025, bars: 0.065 }),
  dream: look({ bloom: 1.3, threshold: 0.55, sat: 1.05, contrast: 0.92, lift: [0.05, 0.02, 0.06], vignette: 0.2, grain: 0.015 }),
  neon: look({ bloom: 1.5, threshold: 0.72, sat: 1.4, contrast: 1.18, shadow: [0.02, -0.02, 0.06], vignette: 0.55, grain: 0.03, ca: 0.004 }),
  vintage: look({ bloom: 0.45, threshold: 0.7, sat: 0.65, contrast: 1.06, shadow: [0.03, 0.01, -0.03], high: [0.07, 0.04, -0.02], lift: [0.06, 0.04, 0.01], vignette: 0.6, grain: 0.09, ca: 0.0015, flicker: 0.04 }),
};

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const HEAD = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;
uniform sampler2D tex;`;

const BRIGHT = `${HEAD}
uniform float threshold;
uniform vec2 texel;
void main() {
  vec3 c = (texture2D(tex, uv + texel * vec2(-1.5, -1.5)).rgb + texture2D(tex, uv + texel * vec2(1.5, -1.5)).rgb
          + texture2D(tex, uv + texel * vec2(-1.5, 1.5)).rgb + texture2D(tex, uv + texel * vec2(1.5, 1.5)).rgb) * 0.25;
  // воспринимаемая яркость: насыщенный, но тёмный цвет (розовый фон) не «светится», а огни — да
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  gl_FragColor = vec4(c * smoothstep(threshold, threshold + 0.2, l), 1.0);
}`;

const BLUR = `${HEAD}
uniform vec2 dir;
void main() {
  vec3 s = texture2D(tex, uv).rgb * 0.227027;
  s += (texture2D(tex, uv + dir * 1.3846).rgb + texture2D(tex, uv - dir * 1.3846).rgb) * 0.316216;
  s += (texture2D(tex, uv + dir * 3.2308).rgb + texture2D(tex, uv - dir * 3.2308).rgb) * 0.070270;
  gl_FragColor = vec4(s, 1.0);
}`;

const COMPOSITE = `${HEAD}
uniform sampler2D bloom;
uniform float bloomAmt, ca, vignette, grain, time, sat, contrast, bars, flicker;
uniform vec3 shadowTint, highTint, lift;
void main() {
  vec2 d = uv - 0.5;
  vec3 c;
  if (ca > 0.0) {
    c.r = texture2D(tex, uv + d * ca * 2.0).r;
    c.g = texture2D(tex, uv).g;
    c.b = texture2D(tex, uv - d * ca * 2.0).b;
  } else {
    c = texture2D(tex, uv).rgb;
  }
  c += texture2D(bloom, uv).rgb * bloomAmt;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, sat);
  c = (c - 0.5) * contrast + 0.5;
  c += shadowTint * (1.0 - smoothstep(0.0, 0.6, l)) + highTint * smoothstep(0.4, 1.0, l);
  c += lift * (1.0 - c);
  c *= flicker;
  c *= 1.0 - vignette * smoothstep(0.45, 1.0, length(d) * 1.414);
  float n = fract(sin(dot(uv * 1000.0 + fract(time) * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * grain;
  if (uv.y < bars || uv.y > 1.0 - bars) c = vec3(0.0);
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

const BW = 270; // разрешение буфера свечения (1/4 кадра — быстро и мягко)

interface Program {
  p: WebGLProgram;
  u: (name: string) => WebGLUniformLocation | null;
}

export class PostFX {
  static create(canvas: HTMLCanvasElement, preserve: boolean): PostFX | null {
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: preserve, antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) return null;
    try {
      return new PostFX(gl);
    } catch (e) {
      console.warn('WebGL post-processing disabled:', e);
      return null;
    }
  }

  private scene: WebGLTexture;
  private a: { f: WebGLFramebuffer; t: WebGLTexture };
  private b: { f: WebGLFramebuffer; t: WebGLTexture };
  private bright: Program;
  private blur: Program;
  private comp: Program;

  private constructor(private gl: WebGLRenderingContext) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.bright = this.program(BRIGHT);
    this.blur = this.program(BLUR);
    this.comp = this.program(COMPOSITE);
    this.scene = this.texture(0);
    this.a = this.fbo();
    this.b = this.fbo();
  }

  private program(fs: string): Program {
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
    const cache = new Map<string, WebGLUniformLocation | null>();
    return {
      p,
      u: (n) => {
        if (!cache.has(n)) cache.set(n, gl.getUniformLocation(p, n));
        return cache.get(n)!;
      },
    };
  }

  private texture(size: number) {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (size) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return t;
  }

  private fbo() {
    const gl = this.gl;
    const t = this.texture(BW);
    const f = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { f, t };
  }

  private pass(prog: Program, target: WebGLFramebuffer | null, size: number, src: WebGLTexture, set: (p: Program) => void) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.viewport(0, 0, size, size);
    gl.useProgram(prog.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.uniform1i(prog.u('tex'), 0);
    set(prog);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  render(src: HTMLCanvasElement, lookId: LookId, t: number, level: number) {
    const gl = this.gl;
    const L = LOOKS[lookId];
    const out = gl.canvas.width;

    gl.bindTexture(gl.TEXTURE_2D, this.scene);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);

    const bloomAmt = L.bloom * (1 + level * 1.5);
    if (bloomAmt > 0) {
      this.pass(this.bright, this.a.f, BW, this.scene, (p) => {
        gl.uniform1f(p.u('threshold'), L.threshold);
        gl.uniform2f(p.u('texel'), 1 / src.width, 1 / src.height);
      });
      // два прохода размытия с растущим радиусом — широкое мягкое свечение
      for (const r of [1, 2.2]) {
        this.pass(this.blur, this.b.f, BW, this.a.t, (p) => gl.uniform2f(p.u('dir'), r / BW, 0));
        this.pass(this.blur, this.a.f, BW, this.b.t, (p) => gl.uniform2f(p.u('dir'), 0, r / BW));
      }
    }

    this.pass(this.comp, null, out, this.scene, (p) => {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.a.t);
      gl.uniform1i(p.u('bloom'), 1);
      gl.uniform1f(p.u('bloomAmt'), bloomAmt);
      gl.uniform1f(p.u('ca'), L.ca);
      gl.uniform1f(p.u('vignette'), L.vignette);
      gl.uniform1f(p.u('grain'), L.grain);
      gl.uniform1f(p.u('time'), t);
      gl.uniform1f(p.u('sat'), L.sat);
      gl.uniform1f(p.u('contrast'), L.contrast);
      gl.uniform1f(p.u('bars'), L.bars);
      gl.uniform1f(p.u('flicker'), 1 - L.flicker * (0.5 + 0.5 * Math.sin(t * 37) * Math.sin(t * 13)));
      gl.uniform3fv(p.u('shadowTint'), L.shadow);
      gl.uniform3fv(p.u('highTint'), L.high);
      gl.uniform3fv(p.u('lift'), L.lift);
      gl.activeTexture(gl.TEXTURE0);
    });
  }
}

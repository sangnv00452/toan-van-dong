import { H, PALETTE, W } from './config';
import { Sfx } from './core/audio';
import { Camera } from './core/camera';
import { panel, text } from './core/draw';
import { HandTracker } from './core/hand-tracker';
import { InputManager } from './core/input';
import { Music } from './core/music';
import { Progress } from './core/progress';
import { SplashScene } from './scenes/splash-scene';

export interface Scene {
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

/** Owns the canvas, camera, hand tracker, input, sound, saved progress and the current screen. */
export class App {
  readonly ctx: CanvasRenderingContext2D;
  readonly camera = new Camera();
  readonly tracker = new HandTracker();
  readonly sfx = new Sfx();
  readonly music = new Music(this.sfx);
  readonly progress = new Progress();
  readonly input: InputManager;
  private scene: Scene;
  private last = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not supported');
    this.ctx = ctx;
    this.input = new InputManager(canvas);
    this.scene = new SplashScene(this);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  start(): void {
    void this.camera.start();
    void this.tracker.init();
    requestAnimationFrame(this.frame);
  }

  setScene(scene: Scene): void {
    this.scene = scene;
  }

  /** Fits the 16:9 canvas into the window, sharp on high-DPI screens. */
  private resize(): void {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    const cssW = Math.floor(W * scale);
    const cssH = Math.floor(H * scale);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.floor(cssW * dpr);
    this.canvas.height = Math.floor(cssH * dpr);
  }

  private frame = (t: number): void => {
    const dt = this.last ? Math.min(0.05, (t - this.last) / 1000) : 0;
    this.last = t;

    const tips = this.camera.ready && this.tracker.status === 'ready' ? this.tracker.detect(this.camera.video) : null;
    this.input.update(dt, tips ? tips.map((p) => this.camera.toCanvas(p.x, p.y)) : null);
    this.scene.update(dt);

    const ctx = this.ctx;
    ctx.setTransform(this.canvas.width / W, 0, 0, this.canvas.height / H, 0, 0);
    this.drawBackground(ctx);
    this.scene.draw(ctx);
    this.drawPointers(ctx);
    this.drawStatus(ctx);
    requestAnimationFrame(this.frame);
  };

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#7fd3d8');
    g.addColorStop(1, '#1f6f8b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (this.camera.ready) {
      this.camera.draw(ctx);
      // Soft tint keeps the player visible but lets the game graphics stand out.
      ctx.fillStyle = 'rgba(10, 60, 50, 0.35)';
      ctx.fillRect(0, 0, W, H);
    }
  }

  private drawPointers(ctx: CanvasRenderingContext2D): void {
    for (const p of this.input.pointers) {
      const r = p.source === 'hand' ? 20 : 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 210, 63, 0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.yellow;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = PALETTE.white;
      ctx.stroke();
    }
  }

  /** Small badge: is the camera/hand tracking working, or are we on mouse mode? */
  private drawStatus(ctx: CanvasRenderingContext2D): void {
    let msg: string;
    let color: string;
    if (this.camera.error) {
      msg = `🖱️ ${this.camera.error} – chơi bằng chuột`;
      color = PALETTE.red;
    } else if (!this.camera.ready) {
      msg = '📷 Đang mở camera…';
      color = PALETTE.orange;
    } else if (this.tracker.status === 'loading') {
      msg = '✋ Đang tải bộ nhận diện tay…';
      color = PALETTE.orange;
    } else if (this.tracker.status === 'failed') {
      msg = '🖱️ Không tải được nhận diện tay – chơi bằng chuột';
      color = PALETTE.red;
    } else {
      const n = this.input.handCount;
      msg = n ? `✋ Đang thấy ${n} bàn tay` : '✋ Giơ tay lên trước camera';
      color = n ? PALETTE.green : 'rgba(29,35,64,0.8)';
    }
    ctx.font = '700 18px sans-serif';
    const w = ctx.measureText(msg).width + 40;
    panel(ctx, W - w - 10, H - 40, w, 32, 16, color);
    text(ctx, msg, W - w / 2 - 10, H - 23, { size: 18, weight: 700 });
  }
}

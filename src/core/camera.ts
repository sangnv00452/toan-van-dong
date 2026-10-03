import { H, W } from '../config';

/** Webcam stream drawn mirrored ("like a mirror") to cover the whole canvas. */
export class Camera {
  readonly video: HTMLVideoElement;
  ready = false;
  error: string | null = null;

  constructor() {
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
  }

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error = 'Trình duyệt không hỗ trợ camera';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      this.video.srcObject = stream;
      await this.video.play();
      this.ready = true;
    } catch (err) {
      console.error('[camera]', err);
      this.error = 'Không mở được camera';
    }
  }

  /** Where the video lands on the canvas when scaled to cover it. */
  private coverRect(): { dx: number; dy: number; dw: number; dh: number } {
    const vw = this.video.videoWidth || W;
    const vh = this.video.videoHeight || H;
    const s = Math.max(W / vw, H / vh);
    const dw = vw * s;
    const dh = vh * s;
    return { dx: (W - dw) / 2, dy: (H - dh) / 2, dw, dh };
  }

  /** Maps a normalized camera point (0..1) to canvas coordinates, mirrored. */
  toCanvas(nx: number, ny: number): { x: number; y: number } {
    const r = this.coverRect();
    return { x: r.dx + (1 - nx) * r.dw, y: r.dy + ny * r.dh };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.ready) return;
    const r = this.coverRect();
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.video, W - r.dx - r.dw, r.dy, r.dw, r.dh);
    ctx.restore();
  }
}

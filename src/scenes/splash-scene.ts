import type { App, Scene } from '../app';
import { H, PALETTE, W } from '../config';
import { panel, text } from '../core/draw';
import { drawFrog, drawLilyPad, drawPond } from '../core/frog-art';
import { HomeScene } from './home-scene';

/**
 * First screen. One click/key press is required: browsers only allow sound,
 * music and fullscreen after a real user action.
 */
export class SplashScene implements Scene {
  private t = 0;

  constructor(private readonly app: App) {}

  update(dt: number): void {
    this.t += dt;
    if (this.app.input.click || this.app.input.key) {
      this.app.sfx.unlock();
      if (!this.app.progress.muted) this.app.music.start();
      document.documentElement.requestFullscreen?.().catch(() => undefined);
      this.app.setScene(new HomeScene(this.app));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawPond(ctx, this.t);
    const bob = Math.sin(this.t * 2.5) * 6;
    drawLilyPad(ctx, W / 2, 330, 150);
    drawFrog(ctx, W / 2, 285 + bob, 1.3, { mood: 'happy', blink: this.t % 3 < 0.12 });
    text(ctx, 'MATH FROG', W / 2, 90, { size: 92, color: PALETTE.yellow, outline: PALETTE.ink });
    text(ctx, 'Học toán lớp 5 cùng ếch Green', W / 2, 165, { size: 34, outline: PALETTE.ink });
    const pulse = 1 + Math.sin(this.t * 4) * 0.04;
    ctx.save();
    ctx.translate(W / 2, 485);
    ctx.scale(pulse, pulse);
    panel(ctx, -330, -48, 660, 96, 48, PALETTE.green, PALETTE.white, 5);
    text(ctx, 'Nhấn chuột hoặc phím bất kỳ để bắt đầu', 0, 2, { size: 32 });
    ctx.restore();
    text(ctx, '🔒 Camera chỉ dùng để tìm vị trí bàn tay ngay trên máy này – không chụp, không lưu, không gửi hình ảnh đi đâu.', W / 2, 590, {
      size: 21,
      weight: 600,
      outline: PALETTE.ink,
      maxWidth: W - 120,
    });
    text(ctx, 'Cuộc thi Sản phẩm STEM 2026 · Trường Tiểu học Đô thị Sài Đồng', W / 2, H - 70, { size: 22, weight: 600, outline: PALETTE.ink });
  }
}

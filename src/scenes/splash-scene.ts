import type { App, Scene } from '../app';
import { H, PALETTE, W } from '../config';
import { emoji, panel, text } from '../core/draw';
import { MenuScene } from './menu-scene';

/**
 * First screen. One click/key press is required: browsers only allow sound
 * and fullscreen after a real user action.
 */
export class SplashScene implements Scene {
  private t = 0;

  constructor(private readonly app: App) {}

  update(dt: number): void {
    this.t += dt;
    if (this.app.input.click || this.app.input.key) {
      this.app.sfx.unlock();
      document.documentElement.requestFullscreen?.().catch(() => undefined);
      this.app.setScene(new MenuScene(this.app));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const bob = Math.sin(this.t * 3) * 8;
    emoji(ctx, '🙌', W / 2 - 500, 200 + bob, 100);
    emoji(ctx, '🧮', W / 2 + 500, 200 - bob, 100);
    text(ctx, 'TOÁN VẬN ĐỘNG', W / 2, 200, { size: 84, color: PALETTE.yellow, outline: PALETTE.ink });
    text(ctx, 'Học toán bằng cả cơ thể – chỉ cần một chiếc camera!', W / 2, 290, { size: 34, outline: PALETTE.ink });
    const pulse = 1 + Math.sin(this.t * 4) * 0.04;
    ctx.save();
    ctx.translate(W / 2, 420);
    ctx.scale(pulse, pulse);
    panel(ctx, -330, -50, 660, 100, 50, PALETTE.green, PALETTE.white, 5);
    text(ctx, 'Nhấn chuột hoặc phím bất kỳ để bắt đầu', 0, 2, { size: 32 });
    ctx.restore();
    text(ctx, '🔒 Camera chỉ dùng để tìm vị trí bàn tay ngay trên máy này – không chụp, không lưu, không gửi hình ảnh đi đâu.', W / 2, 560, {
      size: 21,
      weight: 600,
      outline: PALETTE.ink,
      maxWidth: W - 120,
    });
    text(ctx, 'Cuộc thi Sản phẩm STEM 2026 · Trường Tiểu học Đô thị Sài Đồng', W / 2, H - 80, { size: 22, weight: 600, outline: PALETTE.ink });
  }
}

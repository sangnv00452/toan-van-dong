import type { App, Scene } from '../app';
import { H, type Level, PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { emoji, panel, text } from '../core/draw';
import { Effects } from '../core/effects';
import type { GameDef } from '../games/types';
import { MenuScene } from './menu-scene';
import { PlayScene } from './play-scene';

const PRAISE = ['Cố lên nhé!', 'Khá lắm!', 'Giỏi quá!', 'Xuất sắc!'];

/** Final score, stars (1 player) or the winner (2 players). */
export class ResultScene implements Scene {
  private readonly fx = new Effects();
  private readonly again: DwellButton;
  private readonly menu: DwellButton;
  private confettiTimer = 0;

  constructor(
    private readonly app: App,
    private readonly def: GameDef,
    private readonly level: Level,
    private readonly players: 1 | 2,
    private readonly scores: number[],
  ) {
    this.again = new DwellButton({ x: W / 2 - 440, y: 540, w: 420, h: 110 }, '↻ Chơi lại', { color: PALETTE.green, size: 40, dwell: 1.0 });
    this.menu = new DwellButton({ x: W / 2 + 20, y: 540, w: 420, h: 110 }, '☰ Chọn trò khác', { color: PALETTE.blue, size: 40, dwell: 1.0 });
    this.fx.confetti(W / 2, H);
  }

  private stars(score: number): number {
    return this.def.stars.filter((s) => score >= s).length;
  }

  update(dt: number): void {
    this.fx.update(dt);
    this.confettiTimer += dt;
    if (this.confettiTimer > 1.5) {
      this.confettiTimer = 0;
      this.fx.confetti(Math.random() * W, H, 30);
    }
    if (this.again.update(dt, this.app.input)) {
      this.app.setScene(new PlayScene(this.app, this.def, this.level, this.players));
    } else if (this.menu.update(dt, this.app.input)) {
      this.app.setScene(new MenuScene(this.app));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    panel(ctx, 140, 60, W - 280, 440, 36, 'rgba(255,255,255,0.94)', PALETTE.yellow, 8);
    text(ctx, this.def.title, W / 2, 120, { size: 44, color: this.def.color });
    if (this.players === 1) {
      const score = this.scores[0];
      const stars = this.stars(score);
      text(ctx, `${score} điểm`, W / 2, 225, { size: 100, color: PALETTE.ink });
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = i < stars ? 1 : 0.25;
        emoji(ctx, '⭐', W / 2 + (i - 1) * 120, 340, 90);
      }
      ctx.globalAlpha = 1;
      text(ctx, PRAISE[stars], W / 2, 440, { size: 44, color: PALETTE.purple });
    } else {
      const [a, b] = this.scores;
      [a, b].forEach((s, i) => {
        const x = W / 2 + (i === 0 ? -230 : 230);
        text(ctx, `NGƯỜI ${i + 1}`, x, 200, { size: 40, color: i === 0 ? PALETTE.blue : PALETTE.orange });
        text(ctx, String(s), x, 300, { size: 110, color: PALETTE.ink });
      });
      text(ctx, 'VS', W / 2, 270, { size: 50, color: PALETTE.red });
      const verdict = a === b ? '🤝 Hòa nhau – cả hai đều giỏi!' : `🏆 NGƯỜI ${a > b ? 1 : 2} chiến thắng!`;
      text(ctx, verdict, W / 2, 430, { size: 46, color: PALETTE.purple });
    }
    this.again.draw(ctx);
    this.menu.draw(ctx);
    this.fx.draw(ctx);
  }
}

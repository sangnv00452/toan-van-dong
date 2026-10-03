import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { text } from '../core/draw';
import { GAMES } from '../games/registry';
import { PracticeScene } from './practice-scene';
import { SetupScene } from './setup-scene';

const CARD_W = 390;
const CARD_H = 158;
const GAP = 18;

/** Green's 9 other games in a 3×3 grid; hold a hand on a card to open it. */
export class MenuScene implements Scene {
  private readonly cards: DwellButton[];
  private readonly back: DwellButton;

  constructor(private readonly app: App) {
    this.back = new DwellButton({ x: 20, y: 20, w: 200, h: 64 }, '⟵ Luyện tập', { color: 'rgba(29,35,64,0.85)', size: 24, dwell: 1.0 });
    const x0 = (W - (CARD_W * 3 + GAP * 2)) / 2;
    this.cards = GAMES.map(
      (g, i) =>
        new DwellButton(
          { x: x0 + (i % 3) * (CARD_W + GAP), y: 112 + Math.floor(i / 3) * (CARD_H + GAP), w: CARD_W, h: CARD_H },
          g.title,
          { color: g.color, icon: g.icon, sub: `${g.topic} · ${g.grades}`, dwell: 1.0, size: 30 },
        ),
    );
  }

  update(dt: number): void {
    if (this.back.update(dt, this.app.input)) {
      this.app.setScene(new PracticeScene(this.app));
      return;
    }
    this.cards.forEach((card, i) => {
      if (card.update(dt, this.app.input)) {
        this.app.sfx.correct();
        this.app.setScene(new SetupScene(this.app, GAMES[i]));
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    text(ctx, '🐸 TRÒ CHƠI CỦA GREEN', W / 2, 48, { size: 50, color: PALETTE.yellow, outline: PALETTE.ink });
    text(ctx, '✋ Chỉ tay vào một trò chơi và giữ yên 1 giây để chọn', W / 2, 92, { size: 22, weight: 700, outline: PALETTE.ink });
    this.back.draw(ctx);
    for (const c of this.cards) c.draw(ctx);
  }
}

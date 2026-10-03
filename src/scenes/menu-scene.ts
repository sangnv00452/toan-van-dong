import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { text } from '../core/draw';
import { GAMES } from '../games/registry';
import { SetupScene } from './setup-scene';

const CARD_W = 390;
const CARD_H = 158;
const GAP = 18;

/** 3×3 grid of games; hold a hand on a card to open it. */
export class MenuScene implements Scene {
  private readonly cards: DwellButton[];

  constructor(private readonly app: App) {
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
    this.cards.forEach((card, i) => {
      if (card.update(dt, this.app.input)) {
        this.app.sfx.correct();
        this.app.setScene(new SetupScene(this.app, GAMES[i]));
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    text(ctx, 'TOÁN VẬN ĐỘNG', W / 2, 48, { size: 52, color: PALETTE.yellow, outline: PALETTE.ink });
    text(ctx, '✋ Chỉ tay vào một trò chơi và giữ yên 1 giây để chọn', W / 2, 92, { size: 22, weight: 700, outline: PALETTE.ink });
    for (const c of this.cards) c.draw(ctx);
  }
}

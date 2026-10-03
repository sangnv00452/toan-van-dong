import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { text } from '../core/draw';
import { drawRankCard } from '../core/frog-art';
import { FROG_GAMES } from '../games/frog/registry';
import { LEVELS_PER_DIFFICULTY } from '../math/grade5';
import { FrogLevelScene } from './frog-level-scene';
import { HomeScene } from './home-scene';
import { MenuScene } from './menu-scene';

const CARD_W = 380;
const GAP = 24;

/** Practice (camera): the three Math Frog games, plus Green's 9 other games. */
export class PracticeScene implements Scene {
  private readonly back: DwellButton;
  private readonly cards: DwellButton[];
  private readonly more: DwellButton;

  constructor(private readonly app: App) {
    this.back = new DwellButton({ x: 20, y: 20, w: 200, h: 64 }, '⟵ Trang chủ', { color: 'rgba(29,35,64,0.85)', size: 24, dwell: 1.0 });
    const x0 = (W - (CARD_W * 3 + GAP * 2)) / 2;
    this.cards = FROG_GAMES.map((g, i) => {
      const cleared = [1, 2, 3].reduce((sum, d) => sum + app.progress.clearedUpTo(g.id, d), 0);
      return new DwellButton({ x: x0 + i * (CARD_W + GAP), y: 150, w: CARD_W, h: 200 }, g.title, {
        color: g.color,
        icon: g.icon,
        sub: `Đã qua ${cleared}/${LEVELS_PER_DIFFICULTY * 3} màn`,
        size: 34,
        dwell: 1.0,
      });
    });
    this.more = new DwellButton({ x: W / 2 - 330, y: 400, w: 660, h: 130 }, '9 trò chơi khác của Green', {
      color: PALETTE.purple,
      icon: '🐸',
      sub: 'Bong bóng, ninja, thủ môn, đồng hồ…',
      size: 34,
      dwell: 1.0,
    });
  }

  update(dt: number): void {
    const input = this.app.input;
    if (this.back.update(dt, input)) {
      this.app.setScene(new HomeScene(this.app));
      return;
    }
    this.cards.forEach((card, i) => {
      if (card.update(dt, input)) {
        this.app.sfx.correct();
        this.app.setScene(new FrogLevelScene(this.app, FROG_GAMES[i]));
      }
    });
    if (this.more.update(dt, input)) {
      this.app.sfx.correct();
      this.app.setScene(new MenuScene(this.app));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    text(ctx, 'LUYỆN TẬP CÙNG GREEN', W / 2, 52, { size: 50, color: PALETTE.yellow, outline: PALETTE.ink });
    text(ctx, '✋ Đứng cách màn hình khoảng 2 mét. Chỉ tay vào một trò và giữ yên 1 giây để chọn', W / 2, 110, {
      size: 22,
      weight: 700,
      outline: PALETTE.ink,
      maxWidth: W - 480,
    });
    this.back.draw(ctx);
    for (const c of this.cards) c.draw(ctx);
    this.more.draw(ctx);
    drawRankCard(ctx, W / 2 - 200, 570, this.app.progress.xp);
  }
}

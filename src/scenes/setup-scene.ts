import type { App, Scene } from '../app';
import { type Level, PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { emoji, panel, text, wrapLines } from '../core/draw';
import type { GameDef } from '../games/types';
import { MenuScene } from './menu-scene';
import { PlayScene } from './play-scene';

const LEVEL_NAMES = ['Dễ', 'Vừa', 'Khó'];

/** Shows how to play; pick a level and 1 or 2 players. */
export class SetupScene implements Scene {
  private level: Level;
  private readonly levelButtons: DwellButton[];
  private readonly back: DwellButton;
  private readonly solo: DwellButton;
  private readonly duo: DwellButton | null;

  constructor(
    private readonly app: App,
    private readonly def: GameDef,
    level: Level = 1,
  ) {
    this.level = level;
    this.back = new DwellButton({ x: 20, y: 20, w: 200, h: 64 }, '⟵ Quay lại', { color: 'rgba(29,35,64,0.85)', size: 26, dwell: 1.0 });
    this.levelButtons = def.levels.map(
      (desc, i) =>
        new DwellButton({ x: 110 + i * 360, y: 360, w: 340, h: 110 }, LEVEL_NAMES[i], {
          color: [PALETTE.green, PALETTE.orange, PALETTE.red][i],
          sub: desc,
          size: 36,
          dwell: 0.6,
        }),
    );
    const startY = 530;
    if (def.versus) {
      this.solo = new DwellButton({ x: 200, y: startY, w: 420, h: 120 }, '▶ 1 NGƯỜI CHƠI', { color: PALETTE.blue, size: 38, dwell: 1.0 });
      this.duo = new DwellButton({ x: 660, y: startY, w: 420, h: 120 }, '⚔ 2 NGƯỜI ĐẤU', { color: PALETTE.purple, size: 38, dwell: 1.0 });
    } else {
      this.solo = new DwellButton({ x: W / 2 - 230, y: startY, w: 460, h: 120 }, '▶ BẮT ĐẦU', { color: PALETTE.blue, size: 40, dwell: 1.0 });
      this.duo = null;
    }
  }

  update(dt: number): void {
    const input = this.app.input;
    if (this.back.update(dt, input)) {
      this.app.setScene(new MenuScene(this.app));
      return;
    }
    this.levelButtons.forEach((b, i) => {
      if (b.update(dt, input)) {
        this.level = (i + 1) as Level;
        this.app.sfx.pop();
      }
      b.opts.selected = this.level === i + 1;
    });
    if (this.solo.update(dt, input)) this.app.setScene(new PlayScene(this.app, this.def, this.level, 1));
    else if (this.duo?.update(dt, input)) this.app.setScene(new PlayScene(this.app, this.def, this.level, 2));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const d = this.def;
    panel(ctx, 110, 100, W - 220, 230, 30, 'rgba(255,255,255,0.93)', d.color, 6);
    emoji(ctx, d.icon, 210, 215, 110);
    text(ctx, d.title, 300, 150, { size: 50, color: d.color, align: 'left', outline: null, maxWidth: W - 450 });
    text(ctx, `${d.topic} · ${d.grades}`, 300, 195, { size: 26, color: PALETTE.ink, align: 'left', weight: 700 });
    wrapLines(ctx, d.howTo, 24, W - 450).forEach((line, i) => {
      text(ctx, line, 300, 238 + i * 32, { size: 24, color: PALETTE.ink, align: 'left', weight: 600 });
    });
    text(ctx, 'Chọn mức:', W / 2, 335, { size: 24, weight: 700, outline: PALETTE.ink });
    this.back.draw(ctx);
    for (const b of this.levelButtons) b.draw(ctx);
    this.solo.draw(ctx);
    this.duo?.draw(ctx);
  }
}

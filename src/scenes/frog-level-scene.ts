import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { emoji, panel, text, wrapLines } from '../core/draw';
import { isUnlocked } from '../core/progress';
import type { FrogGameDef } from '../games/frog/types';
import { type Difficulty, LEVELS_PER_DIFFICULTY, levelTopic } from '../math/grade5';
import { ChallengeScene } from './challenge-scene';
import { PracticeScene } from './practice-scene';

const DIFF_NAMES = ['Dễ', 'Vừa', 'Khó'];
const DIFF_COLORS = [PALETTE.green, PALETTE.orange, PALETTE.red];

/** Pick a difficulty (Dễ, Vừa, Khó) and one of its 5 levels; later levels unlock one by one. */
export class FrogLevelScene implements Scene {
  private readonly back: DwellButton;
  private readonly diffButtons: DwellButton[];
  private readonly levelButtons: DwellButton[];
  private readonly start: DwellButton;

  constructor(
    private readonly app: App,
    private readonly game: FrogGameDef,
    private difficulty: Difficulty = 1,
    private level = 0,
  ) {
    this.back = new DwellButton({ x: 20, y: 20, w: 200, h: 64 }, '⟵ Quay lại', { color: 'rgba(29,35,64,0.85)', size: 24, dwell: 1.0 });
    this.diffButtons = DIFF_NAMES.map(
      (name, i) => new DwellButton({ x: 110 + i * 360, y: 300, w: 340, h: 84 }, name, { color: DIFF_COLORS[i], size: 34, dwell: 0.6 }),
    );
    this.levelButtons = Array.from(
      { length: LEVELS_PER_DIFFICULTY },
      (_, i) => new DwellButton({ x: 110 + i * 216, y: 410, w: 196, h: 96 }, `Màn ${i + 1}`, { color: PALETTE.blue, size: 30, dwell: 0.6 }),
    );
    this.start = new DwellButton({ x: W / 2 - 230, y: 600, w: 460, h: 100 }, '▶ BẮT ĐẦU', { color: PALETTE.blue, size: 40, dwell: 1.0 });
    if (!this.level) this.level = Math.min(LEVELS_PER_DIFFICULTY, this.cleared + 1);
  }

  private get cleared(): number {
    return this.app.progress.clearedUpTo(this.game.id, this.difficulty);
  }

  update(dt: number): void {
    const input = this.app.input;
    if (this.back.update(dt, input)) {
      this.app.setScene(new PracticeScene(this.app));
      return;
    }
    this.diffButtons.forEach((b, i) => {
      if (b.update(dt, input)) {
        this.difficulty = (i + 1) as Difficulty;
        this.level = Math.min(LEVELS_PER_DIFFICULTY, this.cleared + 1);
        this.app.sfx.pop();
      }
      b.opts.selected = this.difficulty === i + 1;
      const done = this.app.progress.clearedUpTo(this.game.id, i + 1);
      b.label = `${DIFF_NAMES[i]}  ·  ${done}/${LEVELS_PER_DIFFICULTY}`;
    });
    this.levelButtons.forEach((b, i) => {
      const level = i + 1;
      const open = isUnlocked(this.cleared, level);
      if (b.update(dt, input)) {
        if (open) {
          this.level = level;
          this.app.sfx.pop();
        } else {
          this.app.sfx.wrong();
        }
      }
      b.opts.selected = this.level === level;
      b.opts.color = open ? (level <= this.cleared ? PALETTE.green : PALETTE.blue) : 'rgba(80,80,90,0.85)';
      b.label = open ? (level <= this.cleared ? `✓ Màn ${level}` : `Màn ${level}`) : `🔒 Màn ${level}`;
    });
    if (this.start.update(dt, input)) {
      this.app.sfx.correct();
      this.app.setScene(new ChallengeScene(this.app, this.game, this.difficulty, this.level));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const g = this.game;
    panel(ctx, 110, 96, W - 220, 186, 28, 'rgba(255,255,255,0.93)', g.color, 6);
    emoji(ctx, g.icon, 200, 189, 96);
    text(ctx, g.title, 280, 136, { size: 46, color: g.color, align: 'left', outline: null });
    wrapLines(ctx, g.howTo, 22, W - 430).forEach((line, i) => {
      text(ctx, line, 280, 182 + i * 29, { size: 22, color: PALETTE.ink, align: 'left', weight: 600 });
    });
    this.back.draw(ctx);
    for (const b of this.diffButtons) b.draw(ctx);
    for (const b of this.levelButtons) b.draw(ctx);

    const d = this.difficulty;
    panel(ctx, 110, 522, W - 220, 64, 20, 'rgba(29,35,64,0.85)', PALETTE.yellow, 3);
    text(ctx, `Màn ${this.level} · ${DIFF_NAMES[d - 1]}: ${g.goalText(d, this.level)} · Toán: ${levelTopic(d, this.level)}`, W / 2, 554, {
      size: 24,
      weight: 700,
      maxWidth: W - 260,
    });
    this.start.draw(ctx);
  }
}

import type { App, Scene } from '../app';
import { H, PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { panel, text } from '../core/draw';
import { Effects } from '../core/effects';
import { drawFrog, drawRankCard } from '../core/frog-art';
import { RANKS, rankIndex } from '../core/progress';
import type { FrogGameDef } from '../games/frog/types';
import { type Difficulty, LEVELS_PER_DIFFICULTY } from '../math/grade5';
import { ChallengeScene } from './challenge-scene';
import { FrogLevelScene } from './frog-level-scene';

export interface ChallengeOutcome {
  cleared: boolean;
  message: string;
  correct: number;
  wrong: number;
  goal: number;
  /** KN earned this time. */
  xp: number;
  rankUp: boolean;
  firstClear: boolean;
}

/** Cleared or not, KN earned, rank; then next level, replay or back to the level list. */
export class ChallengeResultScene implements Scene {
  private readonly fx = new Effects();
  private readonly buttons: { button: DwellButton; go: () => Scene }[] = [];
  private t = 0;

  constructor(
    private readonly app: App,
    private readonly game: FrogGameDef,
    difficulty: Difficulty,
    private readonly level: number,
    private readonly outcome: ChallengeOutcome,
  ) {
    const actions: { label: string; color: string; go: () => Scene }[] = [];
    if (outcome.cleared && level < LEVELS_PER_DIFFICULTY) {
      actions.push({ label: '▶ Màn tiếp', color: PALETTE.green, go: () => new ChallengeScene(app, game, difficulty, level + 1) });
    }
    actions.push({ label: '↻ Chơi lại', color: outcome.cleared ? PALETTE.blue : PALETTE.green, go: () => new ChallengeScene(app, game, difficulty, level) });
    actions.push({ label: '☰ Chọn màn', color: PALETTE.purple, go: () => new FrogLevelScene(app, game, difficulty) });
    const w = 340;
    const x0 = W / 2 - (actions.length * w + (actions.length - 1) * 24) / 2;
    actions.forEach((a, i) => {
      this.buttons.push({
        button: new DwellButton({ x: x0 + i * (w + 24), y: 580, w, h: 100 }, a.label, { color: a.color, size: 36, dwell: 1.0 }),
        go: a.go,
      });
    });
    if (outcome.cleared) this.fx.confetti(W / 2, H);
  }

  update(dt: number): void {
    this.t += dt;
    this.fx.update(dt);
    if (this.outcome.rankUp && this.t % 1.2 < dt) this.fx.confetti(Math.random() * W, H, 30);
    for (const b of this.buttons) {
      if (b.button.update(dt, this.app.input)) {
        this.app.setScene(b.go());
        return;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const o = this.outcome;
    panel(ctx, 120, 40, W - 240, 510, 36, 'rgba(255,255,255,0.95)', o.cleared ? PALETTE.green : PALETTE.orange, 8);
    drawFrog(ctx, 290, 250, 1.2, { mood: o.cleared ? 'happy' : 'sad', blink: this.t % 3 < 0.12 });
    text(ctx, o.cleared ? '🎉 QUA MÀN!' : '💦 CHƯA QUA MÀN', 770, 105, { size: 54, color: o.cleared ? PALETTE.green : PALETTE.orange });
    text(ctx, o.message, 770, 170, { size: 26, color: PALETTE.ink, weight: 700, maxWidth: 680 });
    text(ctx, `${this.game.title} · Màn ${this.level}`, 770, 222, { size: 26, color: this.game.color });
    text(ctx, `Đúng ${o.correct} / ${o.goal} câu · Sai ${o.wrong} câu`, 770, 280, { size: 34, color: PALETTE.ink });
    text(ctx, `+${o.xp} KN`, 770, 350, { size: 60, color: PALETTE.purple });
    if (o.firstClear && this.level < LEVELS_PER_DIFFICULTY) {
      text(ctx, `🔓 Đã mở khóa Màn ${this.level + 1}`, 770, 410, { size: 28, color: PALETTE.blue });
    }
    if (o.rankUp) {
      const rank = RANKS[rankIndex(this.app.progress.xp)];
      text(ctx, `⬆ LÊN HẠNG: ${rank.icon} ${rank.name}!`, 290, 410, { size: 30, color: PALETTE.orange, maxWidth: 320 });
    }
    drawRankCard(ctx, 90 + 120, 440, this.app.progress.xp);
    for (const b of this.buttons) b.button.draw(ctx);
    this.fx.draw(ctx);
  }
}

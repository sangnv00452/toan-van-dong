import type { App, Scene } from '../app';
import { H, HUD_H, PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { panel, text } from '../core/draw';
import { Effects } from '../core/effects';
import { xpFor } from '../core/progress';
import type { ChallengeRound, FrogGameDef } from '../games/frog/types';
import type { Difficulty } from '../math/grade5';
import { ChallengeResultScene, type ChallengeOutcome } from './challenge-result-scene';
import { FrogLevelScene } from './frog-level-scene';

/** Runs one Math Frog level: 3-2-1, play until the goal is reached, time runs out or Green fails. */
export class ChallengeScene implements Scene {
  private round: ChallengeRound | null = null;
  private readonly fx = new Effects();
  private readonly exit: DwellButton;
  private state: 'countdown' | 'play' | 'done' = 'countdown';
  private countdown = 3;
  private doneTimer = 0;
  private correct = 0;
  private wrong = 0;
  private outcome: ChallengeOutcome | null = null;
  private readonly goal: number;
  private readonly limit: number | null;
  private timeLeft: number;

  constructor(
    private readonly app: App,
    private readonly game: FrogGameDef,
    private readonly difficulty: Difficulty,
    private readonly level: number,
  ) {
    this.goal = game.goal(difficulty, level);
    this.limit = game.timeLimit(difficulty, level);
    this.timeLeft = this.limit ?? 0;
    this.exit = new DwellButton({ x: 10, y: 10, w: 150, h: 62 }, '⟵ Thoát', { color: 'rgba(29,35,64,0.8)', size: 24, dwell: 1.5 });
  }

  private startRound(): void {
    this.round = this.game.create({
      region: { x: 0, y: 0, w: W, h: H },
      difficulty: this.difficulty,
      level: this.level,
      fx: this.fx,
      sfx: this.app.sfx,
      correct: (x, y) => {
        if (this.state !== 'play') return;
        this.correct++;
        this.app.sfx.correct();
        this.fx.float(x, y, '+1', PALETTE.yellow, 52);
        this.fx.burst(x, y, PALETTE.yellow, 18);
        if (this.correct >= this.goal) this.finish(true, 'Giỏi quá! Em đã hoàn thành thử thách!');
      },
      wrong: (x, y) => {
        if (this.state !== 'play') return;
        this.wrong++;
        this.app.sfx.wrong();
        this.fx.float(x, y, '✗', PALETTE.red, 56);
      },
      fail: (reason) => this.finish(false, reason),
    });
  }

  private finish(cleared: boolean, message: string): void {
    if (this.state === 'done') return;
    this.state = 'done';
    this.doneTimer = cleared ? 1.2 : 0.6;
    const p = this.app.progress;
    const firstClear = cleared && p.clearedUpTo(this.game.id, this.difficulty) < this.level;
    if (cleared) {
      p.markCleared(this.game.id, this.difficulty, this.level);
      this.app.sfx.cheer();
      this.fx.confetti(W / 2, H);
    }
    const xp = xpFor(this.correct, cleared);
    const rankUp = p.addXp(xp);
    this.outcome = { cleared, message, correct: this.correct, wrong: this.wrong, goal: this.goal, xp, rankUp, firstClear };
  }

  update(dt: number): void {
    this.fx.update(dt);
    if (this.exit.update(dt, this.app.input)) {
      this.app.setScene(new FrogLevelScene(this.app, this.game, this.difficulty, this.level));
      return;
    }
    if (this.state === 'countdown') {
      const before = Math.ceil(this.countdown);
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.state = 'play';
        this.app.sfx.go();
        this.startRound();
      } else if (Math.ceil(this.countdown) !== before) {
        this.app.sfx.tick();
      }
      return;
    }
    if (this.state === 'play') {
      this.round?.update(dt, this.app.input.pointers);
      if (this.limit !== null && this.state === 'play') {
        const before = Math.ceil(this.timeLeft);
        this.timeLeft -= dt;
        if (Math.ceil(this.timeLeft) !== before && this.timeLeft <= 5 && this.timeLeft > 0) this.app.sfx.tick();
        if (this.timeLeft <= 0) this.finish(false, 'Hết giờ rồi! Thử lại nhé.');
      }
      return;
    }
    this.round?.update(dt, []);
    this.doneTimer -= dt;
    if (this.doneTimer <= 0 && this.outcome) {
      this.app.setScene(new ChallengeResultScene(this.app, this.game, this.difficulty, this.level, this.outcome));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.round?.draw(ctx);
    this.fx.draw(ctx);
    this.drawHud(ctx);
    if (this.state === 'countdown') {
      panel(ctx, 140, 170, W - 280, 330, 32, 'rgba(29,35,64,0.82)', PALETTE.yellow, 5);
      text(ctx, `${this.game.icon} ${this.game.title} · Màn ${this.level}`, W / 2, 230, { size: 48, color: PALETTE.yellow });
      text(ctx, this.game.goalText(this.difficulty, this.level), W / 2, 300, { size: 30, maxWidth: W - 340 });
      text(ctx, String(Math.ceil(this.countdown)), W / 2, 420, { size: 130, outline: PALETTE.ink });
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(29,35,64,0.6)';
    ctx.fillRect(0, 0, W, HUD_H);
    this.exit.draw(ctx);
    text(ctx, `${this.game.title} · Màn ${this.level}`, 185, 43, { size: 28, align: 'left', maxWidth: 360, outline: PALETTE.ink });
    if (this.limit !== null) {
      const secs = Math.max(0, Math.ceil(this.timeLeft));
      const urgent = this.state === 'play' && secs <= 10;
      panel(ctx, W / 2 - 80, 12, 160, 60, 30, urgent ? PALETTE.red : PALETTE.white);
      text(ctx, `⏱ ${secs}`, W / 2, 43, { size: 34, color: urgent ? PALETTE.white : PALETTE.ink });
      ctx.fillStyle = PALETTE.yellow;
      ctx.fillRect(0, HUD_H - 5, W * Math.max(0, this.timeLeft / this.limit), 5);
    }
    panel(ctx, W - 250, 12, 230, 60, 30, PALETTE.yellow, PALETTE.white, 3);
    text(ctx, `${this.game.goalIcon} ${this.correct} / ${this.goal}`, W - 135, 43, { size: 32, color: PALETTE.ink });
  }
}

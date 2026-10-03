import type { App, Scene } from '../app';
import { contains, H, HUD_H, type Level, PALETTE, type Rect, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { panel, text } from '../core/draw';
import { Effects } from '../core/effects';
import type { GameDef, GameRound } from '../games/types';
import { MenuScene } from './menu-scene';
import { ResultScene } from './result-scene';

const PLAYER_COLORS = [PALETTE.blue, PALETTE.orange];

/** Runs one game: 3-2-1 countdown, the timed rounds, then the results. */
export class PlayScene implements Scene {
  private readonly regions: Rect[];
  private readonly scores: number[];
  private rounds: GameRound[] = [];
  private readonly fx = new Effects();
  private readonly exit: DwellButton;
  private state: 'countdown' | 'play' | 'done' = 'countdown';
  private countdown = 3;
  private timeLeft: number;
  private doneTimer = 1.5;

  constructor(
    private readonly app: App,
    private readonly def: GameDef,
    private readonly level: Level,
    private readonly players: 1 | 2,
  ) {
    this.regions =
      players === 2
        ? [
            { x: 0, y: 0, w: W / 2, h: H },
            { x: W / 2, y: 0, w: W / 2, h: H },
          ]
        : [{ x: 0, y: 0, w: W, h: H }];
    this.scores = this.regions.map(() => 0);
    this.timeLeft = def.duration;
    this.exit = new DwellButton({ x: 10, y: 10, w: 150, h: 62 }, '⟵ Menu', { color: 'rgba(29,35,64,0.8)', size: 24, dwell: 1.5 });
  }

  private startRounds(): void {
    this.rounds = this.regions.map((region, i) =>
      this.def.create({
        region,
        level: this.level,
        fx: this.fx,
        sfx: this.app.sfx,
        addScore: (delta, x, y) => {
          this.scores[i] = Math.max(0, this.scores[i] + delta);
          this.fx.float(x, y, delta > 0 ? `+${delta}` : `${delta}`, delta > 0 ? PALETTE.yellow : PALETTE.red, 52);
        },
      }),
    );
  }

  update(dt: number): void {
    this.fx.update(dt);
    if (this.exit.update(dt, this.app.input)) {
      this.app.setScene(new MenuScene(this.app));
      return;
    }
    if (this.state === 'countdown') {
      const before = Math.ceil(this.countdown);
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.state = 'play';
        this.app.sfx.go();
        this.startRounds();
      } else if (Math.ceil(this.countdown) !== before) {
        this.app.sfx.tick();
      }
      return;
    }
    if (this.state === 'play') {
      const before = Math.ceil(this.timeLeft);
      this.timeLeft -= dt;
      if (Math.ceil(this.timeLeft) !== before && this.timeLeft <= 5 && this.timeLeft > 0) this.app.sfx.tick();
      const pointers = this.app.input.pointers;
      this.rounds.forEach((round, i) => {
        const region = this.regions[i];
        round.update(dt, pointers.filter((p) => contains(region, p.x, p.y)));
      });
      if (this.timeLeft <= 0) {
        this.state = 'done';
        this.app.sfx.cheer();
      }
      return;
    }
    this.doneTimer -= dt;
    if (this.doneTimer <= 0) this.app.setScene(new ResultScene(this.app, this.def, this.level, this.players, this.scores));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.rounds.forEach((round, i) => {
      const r = this.regions[i];
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
      round.draw(ctx);
      ctx.restore();
    });
    if (this.players === 2) {
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(W / 2 - 3, HUD_H, 6, H - HUD_H);
    }
    this.fx.draw(ctx);
    this.drawHud(ctx);

    if (this.state === 'countdown') {
      const n = Math.ceil(this.countdown);
      text(ctx, this.def.title, W / 2, 250, { size: 64, color: PALETTE.yellow, outline: PALETTE.ink });
      text(ctx, String(n), W / 2, 420, { size: 200, outline: PALETTE.ink });
      if (this.players === 2) {
        text(ctx, 'NGƯỜI 1 đứng bên TRÁI · NGƯỜI 2 đứng bên PHẢI', W / 2, 580, { size: 32, outline: PALETTE.ink });
      }
    } else if (this.state === 'done') {
      text(ctx, 'HẾT GIỜ!', W / 2, H / 2, { size: 130, color: PALETTE.yellow, outline: PALETTE.ink });
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(29,35,64,0.6)';
    ctx.fillRect(0, 0, W, HUD_H);
    this.exit.draw(ctx);

    // Timer
    const secs = Math.max(0, Math.ceil(this.timeLeft));
    const urgent = this.state === 'play' && secs <= 10;
    panel(ctx, W / 2 - 80, 12, 160, 60, 30, urgent ? PALETTE.red : PALETTE.white);
    text(ctx, `⏱ ${secs}`, W / 2, 43, { size: 34, color: urgent ? PALETTE.white : PALETTE.ink });
    const frac = Math.max(0, this.timeLeft / this.def.duration);
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillRect(0, HUD_H - 5, W * frac, 5);

    if (this.players === 1) {
      text(ctx, this.def.title, 185, 43, { size: 30, align: 'left', maxWidth: W / 2 - 290, outline: PALETTE.ink });
      this.scorePill(ctx, W - 130, this.scores[0], PALETTE.yellow, '⭐');
    } else {
      this.scorePill(ctx, W / 4 + 40, this.scores[0], PLAYER_COLORS[0], 'NGƯỜI 1');
      this.scorePill(ctx, (W * 3) / 4, this.scores[1], PLAYER_COLORS[1], 'NGƯỜI 2');
    }
  }

  private scorePill(ctx: CanvasRenderingContext2D, cx: number, score: number, color: string, label: string): void {
    const w = 220;
    panel(ctx, cx - w / 2, 12, w, 60, 30, color, PALETTE.white, 3);
    text(ctx, `${label}  ${score}`, cx, 43, { size: 32, color: color === PALETTE.yellow ? PALETTE.ink : PALETTE.white, maxWidth: w - 24 });
  }
}

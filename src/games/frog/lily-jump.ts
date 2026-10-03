import { HUD_H, PALETTE } from '../../config';
import { panel, text } from '../../core/draw';
import { drawFrog, drawLilyPad, drawPond } from '../../core/frog-art';
import type { Pointer } from '../../core/input';
import { grade5Question, type Difficulty, type Grade5Question } from '../../math/grade5';
import { shuffle } from '../../math/random';
import { inCircle, TouchTracker } from '../round-kit';
import type { ChallengeContext, ChallengeRound, FrogGameDef } from './types';

const PAD_R = 68;
/** Distance between Green's pad and the next column of answer pads. */
const SPACING = 400;
const ROWS = [275, 440, 605];
const JUMP_TIME = 0.55;
/** Green's pad sinks when it drifts this close to the left edge. */
const EDGE = 70;
/** The screen scrolls faster while Green is right of this, so the next pads stay visible. */
const COMFORT_X = 440;

/** Seconds the player has per question at the base scroll speed. */
const thinkTime = (d: Difficulty, level: number): number => [12, 14, 18][d - 1] - (level - 1);

interface Pad {
  wx: number;
  y: number;
  label: string;
  correct: boolean;
  touch: TouchTracker;
  /** 0 = floating, > 0 = sinking (seconds). */
  sink: number;
}

/**
 * The pond scrolls to the left. Touch the lily pad with the right answer so
 * Green jumps onto it. A wrong pad — or waiting until Green's pad drifts off
 * the screen — drops Green into the water and the level must be replayed.
 */
class LilyJumpRound implements ChallengeRound {
  private q!: Grade5Question;
  private scroll = 0;
  private time = 0;
  private current: Pad;
  private column: Pad[] = [];
  /** Pads already passed, kept floating until they scroll away. */
  private behind: Pad[] = [];
  private jump: { from: Pad; to: Pad; t: number } | null = null;
  private falling: { t: number; reason: string } | null = null;
  private readonly baseSpeed: number;

  constructor(private readonly cc: ChallengeContext) {
    this.baseSpeed = SPACING / thinkTime(cc.difficulty, cc.level);
    this.current = { wx: COMFORT_X, y: ROWS[1], label: '', correct: true, touch: new TouchTracker(), sink: 0 };
    this.nextColumn();
  }

  private screenX(p: Pad): number {
    return this.cc.region.x + p.wx - this.scroll;
  }

  private nextColumn(): void {
    this.q = grade5Question(this.cc.difficulty, this.cc.level, 3);
    const rows = shuffle(ROWS);
    this.column = this.q.options.map((label, i) => ({
      wx: this.current.wx + SPACING + (i - 1) * 30,
      y: rows[i],
      label,
      correct: label === this.q.answer,
      touch: new TouchTracker(),
      sink: 0,
    }));
  }

  private startFall(reason: string): void {
    this.falling = { t: 0, reason };
    this.current.sink = 0.01;
    this.cc.sfx.wrong();
  }

  update(dt: number, pointers: Pointer[]): void {
    this.time += dt;
    const frogX = this.screenX(this.current) - this.cc.region.x;
    const speed = this.baseSpeed + Math.max(0, frogX - COMFORT_X) * 1.2;
    this.scroll += speed * dt;
    for (const p of [this.current, ...this.column]) if (p.sink > 0) p.sink += dt;

    if (this.falling) {
      this.falling.t += dt;
      if (this.falling.t > 0.35 && this.falling.t - dt <= 0.35) {
        this.cc.fx.burst(this.screenX(this.current), this.current.y, '#bfe9ff', 30, 260);
      }
      if (this.falling.t > 1.4) this.cc.fail(this.falling.reason);
      return;
    }

    if (this.jump) {
      this.jump.t += dt;
      if (this.jump.t >= JUMP_TIME) this.land(this.jump.to);
      return;
    }

    if (frogX < EDGE) {
      this.startFall('Lá sen trôi mất rồi! Lần sau trả lời nhanh hơn nhé.');
      return;
    }

    for (const p of this.column) {
      if (p.touch.check(pointers, (x, y) => inCircle(x, y, this.screenX(p), p.y, PAD_R))) {
        this.jump = { from: this.current, to: p, t: 0 };
        this.cc.sfx.whoosh();
        return;
      }
    }
  }

  private land(pad: Pad): void {
    this.jump = null;
    this.behind.push(this.current, ...this.column.filter((p) => p !== pad && pad.correct));
    this.behind = this.behind.filter((p) => this.screenX(p) > -PAD_R);
    this.current = pad;
    const x = this.screenX(pad);
    if (pad.correct) {
      this.cc.correct(x, pad.y - 90);
      this.cc.fx.burst(x, pad.y, PALETTE.green, 16);
      this.nextColumn();
    } else {
      this.cc.wrong(x, pad.y - 90);
      this.cc.fx.float(x, pad.y - 150, `Đáp án đúng: ${this.q.answer}`, PALETTE.yellow, 40);
      this.column = this.column.filter((p) => p === pad || p.correct);
      this.startFall('Ếch Green nhảy nhầm lá và rơi xuống nước rồi!');
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const r = this.cc.region;
    drawPond(ctx, this.time, 0.5, this.scroll);
    for (const p of new Set([...this.behind, ...this.column, this.current])) this.drawPad(ctx, p);

    const { x: fx, y: fy } = this.frog();
    ctx.globalAlpha = this.falling ? Math.max(0, 1 - this.falling.t * 0.9) : 1;
    drawFrog(ctx, fx, fy, 0.72, { mood: this.falling ? 'sad' : 'happy', blink: this.time % 3.5 < 0.12, look: 0.8 });
    ctx.globalAlpha = 1;

    panel(ctx, r.x + 16, HUD_H + 6, r.w - 32, 64, 20, 'rgba(255,255,255,0.93)');
    text(ctx, this.q.text, r.x + r.w / 2, HUD_H + 39, { size: 34, color: PALETTE.ink, maxWidth: r.w - 64 });
  }

  /** Green's position: on a pad, mid-jump, or sinking. */
  frog(): { x: number; y: number } {
    if (this.jump) {
      const k = this.jump.t / JUMP_TIME;
      const a = this.jump.from;
      const b = this.jump.to;
      return {
        x: this.screenX(a) + (this.screenX(b) - this.screenX(a)) * k,
        y: a.y + (b.y - a.y) * k - 34 - Math.sin(k * Math.PI) * 130,
      };
    }
    const sink = this.falling ? this.falling.t * 90 : 0;
    return { x: this.screenX(this.current), y: this.current.y - 34 + sink };
  }

  private drawPad(ctx: CanvasRenderingContext2D, p: Pad): void {
    const x = this.screenX(p);
    const sinking = Math.min(1, p.sink);
    ctx.globalAlpha = 1 - sinking * 0.8;
    drawLilyPad(ctx, x, p.y + sinking * 20, PAD_R * (1 - sinking * 0.3));
    if (p.label) text(ctx, p.label, x, p.y + 4, { size: 40, outline: PALETTE.ink, maxWidth: PAD_R * 1.8 });
    ctx.globalAlpha = 1;
  }
}

export const lilyJumpGame: FrogGameDef = {
  id: 'lily-jump',
  title: 'Nhảy Lá Sen',
  icon: '🪷',
  color: '#2e9e5b',
  howTo: 'Mặt hồ trôi dần sang trái. Chạm vào lá sen ghi ĐÁP ÁN ĐÚNG để ếch Green nhảy sang. Sai, hoặc chậm quá để lá trôi mất, ếch sẽ rơi xuống nước và phải chơi lại!',
  goalIcon: '🪷',
  goal: (_d, level) => 4 + level,
  timeLimit: () => null,
  goalText(d, level) {
    return `Nhảy đúng ${this.goal(d, level)} lá sen liên tiếp, không rơi xuống nước`;
  },
  create: (cc) => new LilyJumpRound(cc),
};

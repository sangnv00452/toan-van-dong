import { H, HUD_H, PALETTE } from '../../config';
import { panel, text } from '../../core/draw';
import { drawApple, drawFrog, drawLilyPad } from '../../core/frog-art';
import type { Pointer } from '../../core/input';
import { grade5Question, type Difficulty, type Grade5Question } from '../../math/grade5';
import { shuffle } from '../../math/random';
import { inCircle, TouchTracker } from '../round-kit';
import type { ChallengeContext, ChallengeRound, FrogGameDef } from './types';

const APPLE_R = 60;
const TONGUE_TIME = 0.3;

interface Apple {
  x: number;
  y: number;
  label: string;
  correct: boolean;
  touch: TouchTracker;
  /** Wrong apple that was touched: greys out and falls away. */
  spoiled: number;
}

/** Fall speed (px/s): faster on later levels, slower on harder maths. */
const fallSpeed = (d: Difficulty, level: number): number => [40, 36, 30][d - 1] + level * [6, 5, 4][d - 1];

/** Answer apples fall from the sky; touch the one with the right answer and Green eats it. */
class AppleCatchRound implements ChallengeRound {
  private q!: Grade5Question;
  private apples: Apple[] = [];
  private lock = 0;
  private time = 0;
  private tongue: { x: number; y: number; t: number } | null = null;
  private readonly frogX: number;
  private readonly frogY = H - 95;
  private readonly speed: number;

  constructor(private readonly cc: ChallengeContext) {
    this.frogX = cc.region.x + cc.region.w / 2;
    this.speed = fallSpeed(cc.difficulty, cc.level);
    this.next();
  }

  private next(): void {
    this.q = grade5Question(this.cc.difficulty, this.cc.level, 4);
    const r = this.cc.region;
    const lanes = shuffle([0, 1, 2, 3]);
    this.apples = this.q.options.map((label, i) => ({
      x: r.x + r.w * (0.14 + 0.24 * lanes[i]),
      y: HUD_H + 40 - i * 55 - Math.random() * 40,
      label,
      correct: label === this.q.answer,
      touch: new TouchTracker(),
      spoiled: 0,
    }));
  }

  frog(): { x: number; y: number } {
    return { x: this.frogX, y: this.frogY };
  }

  update(dt: number, pointers: Pointer[]): void {
    this.time += dt;
    if (this.lock > 0) this.lock -= dt;
    if (this.tongue) {
      this.tongue.t += dt;
      if (this.tongue.t >= TONGUE_TIME) {
        this.tongue = null;
        this.next();
      }
      return;
    }
    const floor = this.frogY - 120;
    for (const a of this.apples) {
      if (a.spoiled > 0) {
        a.spoiled += dt;
        a.y += 400 * dt;
        continue;
      }
      a.y += this.speed * dt;
      const touched = a.touch.check(pointers, (x, y) => inCircle(x, y, a.x, a.y, APPLE_R));
      if (touched && this.lock <= 0 && a.y > HUD_H + 100) {
        if (a.correct) {
          this.cc.sfx.pop();
          this.cc.correct(a.x, a.y);
          this.cc.fx.burst(a.x, a.y, '#e53935', 20);
          this.tongue = { x: a.x, y: a.y, t: 0 };
          return;
        }
        a.spoiled = 0.01;
        this.cc.wrong(a.x, a.y);
        this.lock = 0.4;
      } else if (a.correct && a.y > floor) {
        // Nobody caught it: show the full answer so the player still learns it.
        this.cc.fx.float(this.frogX, floor - 40, `Đáp án: ${this.q.answer}`, PALETTE.yellow, 44);
        this.next();
        return;
      }
    }
    // Wrong apples that reach the frog just drop into the pond.
    this.apples = this.apples.filter((a) => (a.spoiled > 0 ? a.y < H + APPLE_R : a.y < floor + 30));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const r = this.cc.region;
    drawLilyPad(ctx, this.frogX, this.frogY + 40, 120);
    for (const a of this.apples) {
      if (this.tongue && a.correct) continue;
      ctx.globalAlpha = a.spoiled > 0 ? Math.max(0, 1 - a.spoiled * 2) : 1;
      drawApple(ctx, a.x, a.y, APPLE_R, a.spoiled > 0 ? 'grey' : 'red');
      text(ctx, a.label, a.x, a.y + 4, { size: 38, outline: PALETTE.ink, maxWidth: APPLE_R * 1.8 });
      ctx.globalAlpha = 1;
    }
    let tongue: { x: number; y: number } | null = null;
    if (this.tongue) {
      const k = Math.sin((this.tongue.t / TONGUE_TIME) * Math.PI);
      tongue = { x: this.frogX + (this.tongue.x - this.frogX) * k, y: this.frogY + (this.tongue.y - this.frogY) * k };
      drawApple(ctx, tongue.x, tongue.y, APPLE_R * 0.6, 'red');
    }
    drawFrog(ctx, this.frogX, this.frogY, 1.1, { tongue, blink: this.time % 4 < 0.12, look: Math.sin(this.time) * 0.6, mood: 'happy' });
    panel(ctx, r.x + 16, HUD_H + 6, r.w - 32, 64, 20, 'rgba(255,255,255,0.93)');
    text(ctx, this.q.text, r.x + r.w / 2, HUD_H + 39, { size: 34, color: PALETTE.ink, maxWidth: r.w - 64 });
  }
}

export const appleCatchGame: FrogGameDef = {
  id: 'apple-catch',
  title: 'Ếch Ăn Táo',
  icon: '🍎',
  color: '#e53935',
  howTo: 'Táo rơi từ trên cao xuống, mỗi quả ghi một số. Di chuyển tay vào quả táo ghi ĐÁP ÁN ĐÚNG để ếch Green ăn và nhận điểm!',
  goalIcon: '🍎',
  goal: (d, level) => (d === 3 ? 4 : 5) + level,
  timeLimit: (d) => [60, 75, 90][d - 1],
  goalText(d, level) {
    return `Ăn đúng ${this.goal(d, level)} quả táo trong ${this.timeLimit(d, level)} giây`;
  },
  create: (cc) => new AppleCatchRound(cc),
};

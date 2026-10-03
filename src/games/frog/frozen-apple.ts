import { HUD_H, PALETTE } from '../../config';
import { panel, text } from '../../core/draw';
import { drawApple, drawFrog, drawLilyPad } from '../../core/frog-art';
import type { Pointer } from '../../core/input';
import { grade5Question, type Grade5Question } from '../../math/grade5';
import { inCircle, TouchTracker } from '../round-kit';
import type { ChallengeContext, ChallengeRound, FrogGameDef } from './types';

const APPLE_R = 64;
const BRANCH_Y = HUD_H + 125;
const APPLE_Y = BRANCH_Y + 140;
const REACH = 0.25;
const PULL = 0.3;
const FREEZE_TIME = 2.2;
/** Frozen this many times and the level is lost. */
const MAX_FROZEN = 3;

interface Apple {
  x: number;
  label: string;
  correct: boolean;
  touch: TouchTracker;
}

type State =
  | { kind: 'choose' }
  | { kind: 'grab'; apple: Apple; t: number }
  | { kind: 'result'; apple: Apple; t: number };

/**
 * Apples hang on a branch and all look red. Touch the apple with the right
 * answer: Green eats a sweet red apple. A wrong apple turns out to be frozen
 * and Green freezes for a moment.
 */
class FrozenAppleRound implements ChallengeRound {
  private q!: Grade5Question;
  private apples: Apple[] = [];
  private state: State = { kind: 'choose' };
  private frozenCount = 0;
  private time = 0;
  private readonly frogX: number;
  private readonly frogY = 600;

  constructor(private readonly cc: ChallengeContext) {
    this.frogX = cc.region.x + cc.region.w / 2;
    this.next();
  }

  private next(): void {
    const n = this.cc.difficulty === 1 ? 3 : 4;
    this.q = grade5Question(this.cc.difficulty, this.cc.level, n);
    const r = this.cc.region;
    this.apples = this.q.options.map((label, i) => ({
      x: r.x + (r.w * (i + 1)) / (n + 1),
      label,
      correct: label === this.q.answer,
      touch: new TouchTracker(),
    }));
    this.state = { kind: 'choose' };
  }

  update(dt: number, pointers: Pointer[]): void {
    this.time += dt;
    const s = this.state;
    if (s.kind === 'choose') {
      for (const a of this.apples) {
        if (a.touch.check(pointers, (x, y) => inCircle(x, y, a.x, APPLE_Y, APPLE_R))) {
          this.state = { kind: 'grab', apple: a, t: 0 };
          this.cc.sfx.pop();
          return;
        }
      }
      return;
    }
    s.t += dt;
    if (s.kind === 'grab' && s.t >= REACH + PULL) {
      this.state = { kind: 'result', apple: s.apple, t: 0 };
      if (s.apple.correct) {
        this.cc.correct(this.frogX, this.frogY - 110);
        this.cc.fx.float(this.frogX, this.frogY - 170, 'Ngon quá!', PALETTE.yellow, 40);
      } else {
        this.frozenCount++;
        this.cc.wrong(this.frogX, this.frogY - 110);
        this.cc.fx.burst(this.frogX, this.frogY, '#bfe9ff', 30);
        this.cc.fx.float(this.frogX, this.frogY - 170, `Brrr! Táo đóng băng! Đáp án: ${this.q.answer}`, '#bfe9ff', 36);
      }
    } else if (s.kind === 'result') {
      const wait = s.apple.correct ? 0.9 : FREEZE_TIME;
      if (s.t < wait) return;
      if (this.frozenCount >= MAX_FROZEN) this.cc.fail(`Green bị đóng băng ${MAX_FROZEN} lần rồi! Sưởi ấm rồi chơi lại nhé.`);
      else this.next();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const r = this.cc.region;
    const s = this.state;
    // Branch with leaves
    ctx.strokeStyle = '#6d4c41';
    ctx.lineCap = 'round';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(r.x + 30, BRANCH_Y - 20);
    ctx.quadraticCurveTo(r.x + r.w / 2, BRANCH_Y + 25, r.x + r.w - 30, BRANCH_Y - 10);
    ctx.stroke();
    for (const a of this.apples) {
      const taken = s.kind !== 'choose' && s.apple === a;
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(a.x, BRANCH_Y);
      ctx.lineTo(a.x, APPLE_Y - APPLE_R);
      ctx.stroke();
      if (taken) continue;
      const reveal = s.kind === 'result' && !s.apple.correct && a.correct;
      if (reveal) {
        ctx.beginPath();
        ctx.arc(a.x, APPLE_Y, APPLE_R + 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(46, 194, 126, 0.55)';
        ctx.fill();
      }
      drawApple(ctx, a.x, APPLE_Y, APPLE_R, 'red');
      text(ctx, a.label, a.x, APPLE_Y + 4, { size: 40, outline: PALETTE.ink, maxWidth: APPLE_R * 1.8 });
    }

    drawLilyPad(ctx, this.frogX, this.frogY + 45, 130);
    let tongue: { x: number; y: number } | null = null;
    if (s.kind === 'grab') {
      const reach = s.t < REACH ? s.t / REACH : 1 - (s.t - REACH) / PULL;
      tongue = { x: this.frogX + (s.apple.x - this.frogX) * reach, y: this.frogY + (APPLE_Y - this.frogY) * reach };
      // The apple's true colour shows once it is caught.
      drawApple(ctx, tongue.x, tongue.y, APPLE_R * 0.8, s.t < REACH || s.apple.correct ? 'red' : 'ice');
    }
    const frozen = s.kind === 'result' && !s.apple.correct;
    const happy = s.kind === 'result' && s.apple.correct;
    drawFrog(ctx, this.frogX, this.frogY, 1.15, {
      tongue,
      frozen,
      mood: happy ? 'happy' : 'calm',
      blink: !frozen && this.time % 4 < 0.12,
      look: Math.sin(this.time * 0.8) * 0.7,
    });
    // Lives (bottom left, clear of the camera status badge): hearts left, ice cubes used
    const left = MAX_FROZEN - this.frozenCount;
    text(ctx, `${'❤️'.repeat(Math.max(0, left))}${'🧊'.repeat(this.frozenCount)}`, r.x + 30, 680, { size: 34, align: 'left', weight: 400 });

    panel(ctx, r.x + 16, HUD_H + 6, r.w - 32, 64, 20, 'rgba(255,255,255,0.93)');
    text(ctx, this.q.text, r.x + r.w / 2, HUD_H + 39, { size: 34, color: PALETTE.ink, maxWidth: r.w - 64 });
  }
}

export const frozenAppleGame: FrogGameDef = {
  id: 'frozen-apple',
  title: 'Táo Băng',
  icon: '🧊',
  color: '#2f8fd8',
  howTo: 'Các quả táo trông giống hệt nhau. Chạm vào quả ghi ĐÁP ÁN ĐÚNG để ếch ăn táo đỏ. Chọn sai, ếch ăn nhầm táo đóng băng và bị đông cứng! Đóng băng 3 lần là thua.',
  goalIcon: '🍎',
  goal: (_d, level) => 4 + level,
  timeLimit: () => null,
  goalText(d, level) {
    return `Ăn đúng ${this.goal(d, level)} táo đỏ, không bị đóng băng ${MAX_FROZEN} lần`;
  },
  create: (cc) => new FrozenAppleRound(cc),
};

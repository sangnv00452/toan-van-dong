import { H, PALETTE } from '../config';
import { text } from '../core/draw';
import type { Pointer } from '../core/input';
import { arithmeticQuestion, type ChoiceQuestion } from '../math/arithmetic';
import { randInt, shuffle } from '../math/random';
import { BaseRound, inCircle, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

const COLORS = [PALETTE.pink, PALETTE.blue, PALETTE.green, PALETTE.orange, PALETTE.purple, PALETTE.teal];

interface Bubble {
  baseX: number;
  x: number;
  y: number;
  value: number;
  correct: boolean;
  color: string;
  phase: number;
  touch: TouchTracker;
  gone: boolean;
}

/** Three answer bubbles float up; touch the one with the right answer. */
class BubblesRound extends BaseRound {
  private q!: ChoiceQuestion;
  private bubbles: Bubble[] = [];
  private readonly radius: number;
  private readonly speed: number;

  constructor(rc: RoundContext) {
    super(rc);
    this.radius = Math.min(68, rc.region.w / 6 - 10);
    this.speed = [75, 90, 105][rc.level - 1];
    this.next();
  }

  private next(): void {
    this.q = arithmeticQuestion(this.rc.level);
    const r = this.region;
    const slots = shuffle([0, 1, 2]);
    const colors = shuffle(COLORS);
    this.bubbles = this.q.options.map((value, i) => ({
      baseX: r.x + r.w * (0.2 + 0.3 * slots[i]),
      x: 0,
      y: H + this.radius + randInt(0, 90),
      value,
      correct: value === this.q.answer,
      color: colors[i],
      phase: Math.random() * 6,
      touch: new TouchTracker(),
      gone: false,
    }));
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    const ceiling = this.top + this.radius;
    for (const b of this.bubbles) {
      if (b.gone) continue;
      b.y -= this.speed * dt;
      b.x = b.baseX + Math.sin(this.time * 2 + b.phase) * 14;
      const touched = b.touch.check(pointers, (x, y) => inCircle(x, y, b.x, b.y, this.radius));
      if (touched && this.lock <= 0) {
        b.gone = true;
        this.rc.sfx.pop();
        this.rc.fx.burst(b.x, b.y, b.color, 26);
        if (b.correct) {
          this.good(b.x, b.y);
          this.next();
          return;
        }
        this.bad(b.x, b.y);
        this.lock = 0.5;
      } else if (b.y < ceiling) {
        b.gone = true;
        if (b.correct) {
          // Nobody caught it: show the full equation so the player still learns it.
          this.rc.fx.float(this.cx, this.top + 60, this.q.text.replace('?', String(this.q.answer)), PALETTE.yellow, 48);
          this.next();
          return;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const b of this.bubbles) {
      if (b.gone) continue;
      const g = ctx.createRadialGradient(b.x - this.radius * 0.35, b.y - this.radius * 0.35, this.radius * 0.1, b.x, b.y, this.radius);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.35, b.color);
      g.addColorStop(1, b.color);
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.arc(b.x, b.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.stroke();
      // Little knot + string so it reads as a balloon.
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + this.radius);
      ctx.quadraticCurveTo(b.x + 12, b.y + this.radius + 30, b.x, b.y + this.radius + 60);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, String(b.value), b.x, b.y + 2, { size: this.radius * 0.72, outline: PALETTE.ink });
    }
    this.banner(ctx, this.q.text);
  }
}

export const bubblesGame: GameDef = {
  id: 'bubbles',
  title: 'Bắt Bong Bóng',
  icon: '🎈',
  topic: 'Cộng, trừ, nhân, chia',
  grades: 'Lớp 2–5',
  howTo: 'Ba quả bóng bay lên, mỗi quả mang một số. Đưa tay chạm vào quả bóng có đáp án đúng!',
  levels: ['Cộng trừ trong 100', 'Bảng nhân 2–9', 'Nhân, chia, số có 2 chữ số'],
  duration: 60,
  versus: true,
  stars: [5, 10, 15],
  color: PALETTE.pink,
  create: (rc) => new BubblesRound(rc),
};

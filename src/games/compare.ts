import { contains, PALETTE, type Rect } from '../config';
import { emoji, panel, text, value } from '../core/draw';
import type { Pointer } from '../core/input';
import { compareQuestion, type CompareQuestion } from '../math/compare';
import { BaseRound, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

interface Side {
  rect: Rect;
  isLeft: boolean;
  touch: TouchTracker;
  flash: string | null;
}

/** Two values; raise a hand to the side that is BIGGER. */
class CompareRound extends BaseRound {
  private q!: CompareQuestion;
  private sides: Side[];
  /** Seconds left showing the result before the next question. */
  private reveal = 0;

  constructor(rc: RoundContext) {
    super(rc);
    const r = rc.region;
    const gap = 24;
    const w = (r.w - gap * 3) / 2;
    // Upper half of the screen: resting hands (near the hips) cannot touch it by accident.
    const y = this.top + 20;
    const h = 300;
    this.sides = [
      { rect: { x: r.x + gap, y, w, h }, isLeft: true, touch: new TouchTracker(), flash: null },
      { rect: { x: r.x + gap * 2 + w, y, w, h }, isLeft: false, touch: new TouchTracker(), flash: null },
    ];
    this.next();
  }

  private next(): void {
    this.q = compareQuestion(this.rc.level);
    for (const s of this.sides) s.flash = null;
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    if (this.reveal > 0) {
      this.reveal -= dt;
      if (this.reveal <= 0) this.next();
    }
    for (const s of this.sides) {
      const touched = s.touch.check(pointers, (x, y) => contains(s.rect, x, y));
      if (!touched || this.lock > 0 || this.reveal > 0) continue;
      const leftBigger = this.q.leftValue > this.q.rightValue;
      const right = s.isLeft === leftBigger;
      const cx = s.rect.x + s.rect.w / 2;
      const cy = s.rect.y + s.rect.h / 2;
      if (right) {
        this.good(cx, cy, PALETTE.green);
        s.flash = PALETTE.green;
      } else {
        this.bad(cx, cy);
        s.flash = PALETTE.red;
        // Show which side was right.
        const other = this.sides.find((o) => o !== s);
        if (other) other.flash = PALETTE.green;
      }
      this.reveal = right ? 0.6 : 1.2;
      this.lock = 0.6;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.banner(ctx, 'Bên nào LỚN HƠN? Giơ tay chạm vào bên đó!');
    for (const s of this.sides) {
      const { x, y, w, h } = s.rect;
      panel(ctx, x, y, w, h, 28, s.flash ?? 'rgba(255,255,255,0.88)', s.isLeft ? PALETTE.blue : PALETTE.orange, 8);
      emoji(ctx, s.isLeft ? '👈' : '👉', x + w / 2, y + 48, 48);
      const label = s.isLeft ? this.q.left : this.q.right;
      value(ctx, label, x + w / 2, y + h / 2 + 30, Math.min(84, w / 3.2), s.flash ? PALETTE.white : PALETTE.ink, null, w - 40);
    }
    if (this.reveal > 0) {
      const sign = this.q.leftValue > this.q.rightValue ? '>' : '<';
      const a = this.sides[0].rect;
      const midX = a.x + a.w + 12;
      const midY = a.y + a.h / 2 + 30;
      ctx.beginPath();
      ctx.arc(midX, midY, 34, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.yellow;
      ctx.fill();
      text(ctx, sign, midX, midY + 2, { size: 54, color: PALETTE.ink });
    }
  }
}

export const compareGame: GameDef = {
  id: 'compare',
  title: 'Trái Hay Phải?',
  icon: '🆚',
  topic: 'So sánh số, phân số, đơn vị',
  grades: 'Lớp 3–5',
  howTo: 'Hai bên màn hình có hai giá trị. Giơ tay chạm vào bên LỚN HƠN. Cẩn thận với 3,5 và 3,45 nhé!',
  levels: ['Số có 4 chữ số', 'Số thập phân, phân số', 'Đổi đơn vị đo'],
  duration: 60,
  versus: true,
  stars: [6, 12, 18],
  color: PALETTE.blue,
  create: (rc) => new CompareRound(rc),
};

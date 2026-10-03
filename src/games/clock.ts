import { PALETTE } from '../config';
import { panel, text } from '../core/draw';
import type { Pointer } from '../core/input';
import { clockQuestion, type ClockQuestion, type ClockTime } from '../math/clock';
import { BaseRound, inCircle, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

interface NumberSpot {
  n: number;
  x: number;
  y: number;
  touch: TouchTracker;
  flash: string | null;
}

/** A giant clock; touch the number a hand points at. */
class ClockRound extends BaseRound {
  private q!: ClockQuestion;
  private readonly spots: NumberSpot[] = [];
  private readonly cxClock: number;
  private readonly cyClock: number;
  private readonly R = 235;
  private reveal = 0;

  constructor(rc: RoundContext) {
    super(rc);
    this.cxClock = rc.region.x + rc.region.w * 0.66;
    this.cyClock = 425;
    for (let n = 1; n <= 12; n++) {
      const a = (n / 12) * Math.PI * 2;
      this.spots.push({
        n,
        x: this.cxClock + Math.sin(a) * this.R * 0.8,
        y: this.cyClock - Math.cos(a) * this.R * 0.8,
        touch: new TouchTracker(),
        flash: null,
      });
    }
    this.next();
  }

  private next(): void {
    this.q = clockQuestion(this.rc.level);
    for (const s of this.spots) s.flash = null;
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    if (this.reveal > 0) {
      this.reveal -= dt;
      if (this.reveal <= 0) this.next();
    }
    for (const s of this.spots) {
      const touched = s.touch.check(pointers, (x, y) => inCircle(x, y, s.x, s.y, 44));
      if (!touched || this.lock > 0 || this.reveal > 0) continue;
      if (s.n === this.q.answer) {
        s.flash = PALETTE.green;
        this.good(s.x, s.y, PALETTE.green);
        this.reveal = 1.5;
      } else {
        s.flash = PALETTE.red;
        this.bad(s.x, s.y);
        this.lock = 0.5;
      }
    }
    for (const s of this.spots) if (s.flash === PALETTE.red && this.lock <= 0) s.flash = null;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.banner(ctx, 'Chạm vào số ĐÚNG trên đồng hồ!');
    const r = this.region;
    // Question card on the left
    panel(ctx, r.x + 30, this.top + 30, 440, 300, 28, 'rgba(29,35,64,0.85)', PALETTE.yellow, 5);
    this.q.lines.forEach((line, i) => {
      text(ctx, line, r.x + 250, this.top + 110 + i * 70, { size: 36, maxWidth: 400 });
    });
    // Clock face
    const { cxClock: cx, cyClock: cy, R } = this;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = PALETTE.purple;
    ctx.stroke();
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const inner = i % 5 === 0 ? R - 26 : R - 14;
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(a) * inner, cy - Math.cos(a) * inner);
      ctx.lineTo(cx + Math.sin(a) * (R - 6), cy - Math.cos(a) * (R - 6));
      ctx.lineWidth = i % 5 === 0 ? 5 : 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
    }
    for (const s of this.spots) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 38, 0, Math.PI * 2);
      ctx.fillStyle = s.flash ?? '#eef3ff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = PALETTE.blue;
      ctx.stroke();
      text(ctx, String(s.n), s.x, s.y + 2, { size: 38, color: s.flash ? PALETTE.white : PALETTE.ink });
    }
    const showing = this.reveal > 0;
    const time: ClockTime = showing ? this.q.reveal : this.q.show;
    if (showing || this.q.hide !== 'hour') this.hand(ctx, ((time.h % 12) + time.m / 60) * 30, R * 0.45, 14, PALETTE.blue);
    if (showing || this.q.hide !== 'minute') this.hand(ctx, time.m * 6, R * 0.66, 8, PALETTE.red);
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.ink;
    ctx.fill();
    if (!showing && this.q.hide) text(ctx, '?', cx, cy + 75, { size: 56, color: this.q.hide === 'hour' ? PALETTE.blue : PALETTE.red });
  }

  private hand(ctx: CanvasRenderingContext2D, degrees: number, length: number, width: number, color: string): void {
    const a = (degrees * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(this.cxClock, this.cyClock);
    ctx.lineTo(this.cxClock + Math.sin(a) * length, this.cyClock - Math.cos(a) * length);
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

export const clockGame: GameDef = {
  id: 'clock',
  title: 'Đồng Hồ Khổng Lồ',
  icon: '⏰',
  topic: 'Xem giờ, thời gian',
  grades: 'Lớp 2–3',
  howTo: 'Đọc câu hỏi bên trái rồi chạm vào số mà kim đồng hồ chỉ. Kim NGẮN màu xanh là kim giờ, kim DÀI màu đỏ là kim phút.',
  levels: ['Kim ngắn, giờ đúng', 'Kim dài, giờ buổi chiều', 'Thời gian trôi qua'],
  duration: 90,
  versus: false,
  stars: [5, 10, 15],
  color: PALETTE.purple,
  create: (rc) => new ClockRound(rc),
};

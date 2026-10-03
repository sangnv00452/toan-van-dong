import { H, PALETTE } from '../config';
import { text } from '../core/draw';
import type { Pointer } from '../core/input';
import { chance } from '../math/random';
import { keeperRule, type BallSpec, type KeeperRule } from '../math/shapes';
import { BaseRound, inCircle, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

const BASE_RADIUS = 78;
/** Balls can only be blocked once they are this close (scale). */
const BLOCKABLE_SCALE = 0.55;

interface Ball {
  spec: BallSpec;
  correct: boolean;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  t: number;
  dur: number;
  touch: TouchTracker;
}

/** Balls fly at the goal; block only the ones that match the rule. */
class KeeperRound extends BaseRound {
  private readonly rule: KeeperRule;
  private balls: Ball[] = [];
  private spawnTimer = 0.5;
  private readonly spawnEvery: number;
  private readonly flight: number;

  constructor(rc: RoundContext) {
    super(rc);
    this.rule = keeperRule(rc.level);
    this.spawnEvery = [1.7, 1.45, 1.25][rc.level - 1];
    this.flight = [2.9, 2.5, 2.3][rc.level - 1];
  }

  private pos(b: Ball): { x: number; y: number; s: number } {
    const k = Math.min(1, b.t / b.dur);
    const e = k * k;
    return { x: b.sx + (b.tx - b.sx) * e, y: b.sy + (b.ty - b.sy) * e, s: 0.3 + 1.0 * e };
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    const r = this.region;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnEvery;
      const correct = chance(0.45);
      this.balls.push({
        spec: this.rule.make(correct),
        correct,
        sx: this.cx + (Math.random() - 0.5) * r.w * 0.2,
        sy: this.top + 60,
        tx: r.x + r.w * (0.18 + Math.random() * 0.64),
        ty: 330 + Math.random() * 230,
        t: 0,
        dur: this.flight,
        touch: new TouchTracker(),
      });
    }
    for (const b of this.balls) {
      b.t += dt;
      const p = this.pos(b);
      const touched = b.touch.check(pointers, (x, y) => inCircle(x, y, p.x, p.y, BASE_RADIUS * p.s));
      if (touched && p.s >= BLOCKABLE_SCALE) {
        b.t = Infinity; // removed below
        if (b.correct) {
          this.good(p.x, p.y, PALETTE.green);
          this.rc.fx.float(p.x, p.y - 70, 'Chặn đẹp!', PALETTE.green, 38);
        } else {
          this.bad(p.x, p.y, 1);
        }
      } else if (b.t >= b.dur && b.t !== Infinity && b.correct) {
        this.rc.fx.float(p.x, p.y, 'Lọt lưới!', PALETTE.orange, 40);
      }
    }
    this.balls = this.balls.filter((b) => b.t < b.dur);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const r = this.region;
    // Goal frame
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(r.x + 30, H);
    ctx.lineTo(r.x + 30, this.top + 120);
    ctx.lineTo(r.x + r.w - 30, this.top + 120);
    ctx.lineTo(r.x + r.w - 30, H);
    ctx.stroke();
    // Furthest balls first, so near ones are on top.
    for (const b of [...this.balls].sort((a, c) => a.t - c.t)) {
      const p = this.pos(b);
      const R = BASE_RADIUS * p.s;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.white;
      ctx.fill();
      ctx.lineWidth = Math.max(2, 6 * p.s);
      ctx.strokeStyle = p.s >= BLOCKABLE_SCALE ? PALETTE.yellow : PALETTE.ink;
      ctx.stroke();
      drawSpec(ctx, b.spec, p.x, p.y, R);
    }
    this.banner(ctx, `Chỉ chặn ${this.rule.label}!`);
  }
}

/** Draws the angle / shape / labelled rectangle printed on a ball. */
function drawSpec(ctx: CanvasRenderingContext2D, spec: BallSpec, x: number, y: number, R: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = PALETTE.blue;
  ctx.fillStyle = 'rgba(58,134,255,0.25)';
  ctx.lineWidth = Math.max(2, R * 0.07);
  ctx.lineCap = 'round';
  if (spec.kind === 'angle') {
    ctx.rotate(spec.rotation);
    const L = R * 0.72;
    const a = (spec.degrees * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(L, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(Math.cos(-a) * L, Math.sin(-a) * L);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.red;
    ctx.beginPath();
    if (spec.degrees === 90) {
      const s = R * 0.2;
      ctx.moveTo(s, 0);
      ctx.lineTo(s, -s);
      ctx.lineTo(0, -s);
    } else {
      ctx.arc(0, 0, R * 0.22, -a, 0);
    }
    ctx.stroke();
  } else if (spec.kind === 'shape') {
    ctx.rotate(spec.rotation);
    const s = R * 0.55;
    ctx.beginPath();
    if (spec.shape === 'tròn') ctx.arc(0, 0, s, 0, Math.PI * 2);
    else if (spec.shape === 'vuông') ctx.rect(-s * 0.85, -s * 0.85, s * 1.7, s * 1.7);
    else if (spec.shape === 'chữ nhật') ctx.rect(-s * 1.15, -s * 0.6, s * 2.3, s * 1.2);
    else {
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.95, s * 0.7);
      ctx.lineTo(-s * 0.95, s * 0.7);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
  } else {
    const k = (R * 1.15) / Math.max(spec.a, spec.b);
    const w = spec.a * k;
    const h = spec.b * k;
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.stroke();
    const size = Math.max(10, R * 0.24);
    text(ctx, `${spec.a} cm`, 0, h / 2 + size * 0.7, { size, color: PALETTE.ink });
    text(ctx, `${spec.b}`, w / 2 + size * 0.45, 0, { size, color: PALETTE.ink });
  }
  ctx.restore();
}

export const goalkeeperGame: GameDef = {
  id: 'goalkeeper',
  title: 'Ếch Thủ Môn Hình Học',
  icon: '🧤',
  topic: 'Góc, hình, chu vi, diện tích',
  grades: 'Lớp 3–5',
  howTo: 'Ếch Green làm thủ môn! Bóng bay về phía khung thành. Chỉ chặn bóng ĐÚNG yêu cầu (viền vàng là chặn được). Chặn nhầm bị trừ điểm!',
  levels: ['Góc nhọn, vuông, tù', 'Nhận dạng hình', 'Chu vi, diện tích'],
  duration: 60,
  versus: true,
  stars: [5, 10, 15],
  color: PALETTE.green,
  create: (rc) => new KeeperRound(rc),
};

import { H, HUD_H, PALETTE } from '../config';
import { emoji, fraction, measure, panel, text } from '../core/draw';
import type { Pointer } from '../core/input';
import { equivalentFraction, nonEquivalentFraction, pickTarget, type Fraction } from '../math/fractions';
import { chance, pick } from '../math/random';
import { BaseRound, segmentHitsCircle } from './round-kit';
import type { GameDef, RoundContext } from './types';

/** Gravity in px/s² — fruits fly up, slow down and fall back like a real throw. */
const GRAVITY = 900;
/** A hand must move at least this fast (px/s) to count as a slash. */
const SLASH_SPEED = 650;
const TRAIL_SECONDS = 0.18;
const FRUITS = [
  { icon: '🍉', color: '#e63946' },
  { icon: '🍊', color: '#fb8500' },
  { icon: '🍋', color: '#f4c20d' },
  { icon: '🍏', color: '#57cc99' },
  { icon: '🍇', color: '#8338ec' },
  { icon: '🍑', color: '#ff8fab' },
];

interface Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  frac: Fraction;
  correct: boolean;
  icon: string;
  color: string;
}

interface Half {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  color: string;
  side: 1 | -1;
  life: number;
}

/** Slash (swipe a hand fast through) only the fruits equal to the target fraction. */
class NinjaRound extends BaseRound {
  private readonly target: Fraction;
  private fruits: Fruit[] = [];
  private halves: Half[] = [];
  private spawnTimer = 0.4;
  private readonly spawnEvery: number;
  private trails = new Map<string, { x: number; y: number; t: number }[]>();

  constructor(rc: RoundContext) {
    super(rc);
    this.target = pickTarget(rc.level);
    this.spawnEvery = [1.15, 1.0, 0.85][rc.level - 1];
  }

  private spawn(): void {
    const r = this.region;
    const x = r.x + r.w * (0.2 + Math.random() * 0.6);
    const peak = this.top + 60 + Math.random() * 140;
    const startY = H + 60;
    const correct = chance(0.45);
    const f = pick(FRUITS);
    this.fruits.push({
      x,
      y: startY,
      vx: (this.cx - x) * 0.35 + (Math.random() - 0.5) * 120,
      vy: -Math.sqrt(2 * GRAVITY * (startY - peak)),
      r: Math.min(62, r.w / 10),
      frac: correct ? equivalentFraction(this.target) : nonEquivalentFraction(this.target),
      correct,
      icon: f.icon,
      color: f.color,
    });
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnEvery;
      this.spawn();
      if (this.rc.level === 3 && chance(0.3)) this.spawn();
    }

    for (const p of pointers) {
      const trail = this.trails.get(p.id) ?? [];
      trail.push({ x: p.x, y: p.y, t: this.time });
      this.trails.set(p.id, trail.filter((pt) => this.time - pt.t < TRAIL_SECONDS));
    }
    for (const [id, trail] of this.trails) {
      if (!trail.length || this.time - trail[trail.length - 1].t > TRAIL_SECONDS) this.trails.delete(id);
    }

    for (const f of this.fruits) {
      f.vy += GRAVITY * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
    }
    const sliced: Fruit[] = [];
    for (const p of pointers) {
      if (p.speed < SLASH_SPEED) continue;
      for (const f of this.fruits) {
        if (!sliced.includes(f) && segmentHitsCircle(p.px, p.py, p.x, p.y, f.x, f.y, f.r)) sliced.push(f);
      }
    }
    for (const f of sliced) this.slice(f);
    this.fruits = this.fruits.filter((f) => !sliced.includes(f) && !(f.vy > 0 && f.y > H + 80));

    for (const h of this.halves) {
      h.vy += GRAVITY * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rot += h.vr * dt;
      h.life -= dt;
    }
    this.halves = this.halves.filter((h) => h.life > 0);
  }

  private slice(f: Fruit): void {
    this.rc.sfx.whoosh();
    for (const side of [1, -1] as const) {
      this.halves.push({ x: f.x, y: f.y, vx: f.vx + side * 160, vy: f.vy - 120, rot: 0, vr: side * 5, color: f.color, side, life: 1 });
    }
    if (f.correct) this.good(f.x, f.y, f.color);
    else this.bad(f.x, f.y, 1);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const h of this.halves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, h.life);
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.beginPath();
      ctx.arc(0, 0, 50, h.side === 1 ? -Math.PI / 2 : Math.PI / 2, h.side === 1 ? Math.PI / 2 : (Math.PI * 3) / 2);
      ctx.fillStyle = h.color;
      ctx.fill();
      ctx.restore();
    }
    for (const f of this.fruits) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 0.72, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.white;
      ctx.fill();
      emoji(ctx, f.icon, f.x + f.r * 0.75, f.y - f.r * 0.75, f.r * 0.6);
      fraction(ctx, f.frac.n, f.frac.d, f.x, f.y, f.r * 0.42, PALETTE.ink);
    }
    for (const trail of this.trails.values()) {
      if (trail.length < 2) continue;
      ctx.beginPath();
      trail.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 12;
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.stroke();
    }
    this.drawBanner(ctx);
  }

  /** Banner with a real stacked fraction: "Chém quả BẰNG ½". */
  private drawBanner(ctx: CanvasRenderingContext2D): void {
    const r = this.region;
    panel(ctx, r.x + 16, HUD_H + 6, r.w - 32, 64, 20, 'rgba(255,255,255,0.93)');
    const label = 'Vung tay chém quả BẰNG';
    const size = r.w < 800 ? 26 : 34;
    const w = measure(ctx, label, size) + 20 + 40;
    const x0 = this.cx - w / 2;
    text(ctx, label, x0, HUD_H + 39, { size, color: PALETTE.ink, align: 'left' });
    fraction(ctx, this.target.n, this.target.d, x0 + w - 20, HUD_H + 38, 24, PALETTE.red);
  }
}

export const ninjaGame: GameDef = {
  id: 'ninja',
  title: 'Ninja Chém Phân Số',
  icon: '🥷',
  topic: 'Phân số bằng nhau',
  grades: 'Lớp 4–5',
  howTo: 'Trái cây bay lên mang phân số. Vung tay thật nhanh qua quả BẰNG phân số đề bài. Chém nhầm bị trừ điểm!',
  levels: ['Bằng 1/2', 'Bằng 1/3, 2/3, 1/4, 3/4', 'Phân số khó hơn'],
  duration: 60,
  versus: true,
  stars: [5, 10, 15],
  color: PALETTE.red,
  create: (rc) => new NinjaRound(rc),
};

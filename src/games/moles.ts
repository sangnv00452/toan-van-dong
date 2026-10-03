import { PALETTE } from '../config';
import { panel, text } from '../core/draw';
import type { Pointer } from '../core/input';
import { numberForRule, pickRule, type DivRule } from '../math/divisibility';
import { chance, pick } from '../math/random';
import { BaseRound, inCircle, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

/** Seconds before the rule changes, to keep players reading. */
const RULE_SECONDS = 20;

interface Mole {
  x: number;
  y: number;
  state: 'down' | 'up' | 'hit';
  t: number;
  value: number;
  /** For the hit animation: was it a good hit? */
  good: boolean;
  touch: TouchTracker;
}

/** Moles pop up with numbers; whack only those that follow the rule. */
class MolesRound extends BaseRound {
  private rule: DivRule;
  private ruleTimer = 0;
  private spawnTimer = 0.6;
  private readonly moles: Mole[] = [];
  private readonly holeR: number;
  private readonly upTime: number;
  private readonly spawnEvery: number;

  constructor(rc: RoundContext) {
    super(rc);
    const r = rc.region;
    this.rule = pickRule(rc.level);
    this.holeR = Math.min(78, r.w / 6 - 14);
    this.upTime = [2.0, 1.7, 1.45][rc.level - 1];
    this.spawnEvery = [1.0, 0.85, 0.7][rc.level - 1];
    for (const row of [0, 1]) {
      for (const col of [0, 1, 2]) {
        this.moles.push({
          x: r.x + r.w * (1 / 6 + col / 3),
          y: this.top + 190 + row * 210,
          state: 'down',
          t: 0,
          value: 0,
          good: false,
          touch: new TouchTracker(),
        });
      }
    }
  }

  /** How far a mole is out of its hole (0..1). */
  private rise(m: Mole): number {
    if (m.state === 'down') return 0;
    if (m.state === 'hit') return Math.max(0, 1 - m.t / 0.5);
    const rem = this.upTime - m.t;
    return Math.min(1, m.t / 0.15, rem / 0.15);
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    this.ruleTimer += dt;
    if (this.ruleTimer > RULE_SECONDS) {
      this.ruleTimer = 0;
      this.rule = pickRule(this.rc.level, this.rule);
      this.rc.sfx.whoosh();
      this.rc.fx.float(this.cx, this.top + 40, 'ĐỔI LUẬT!', PALETTE.yellow, 56);
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnEvery;
      const free = this.moles.filter((m) => m.state === 'down');
      if (free.length) {
        const m = pick(free);
        m.state = 'up';
        m.t = 0;
        m.value = numberForRule(this.rule, chance(0.5));
      }
    }

    for (const m of this.moles) {
      m.t += dt;
      if (m.state === 'up' && m.t > this.upTime) m.state = 'down';
      if (m.state === 'hit' && m.t > 0.5) m.state = 'down';
      const touched = m.touch.check(pointers, (x, y) => inCircle(x, y, m.x, m.y - this.holeR * 0.7, this.holeR));
      if (touched && m.state === 'up' && this.rise(m) > 0.6) {
        // Judge with the current rule (it may have changed while the mole was up).
        m.good = this.rule.test(m.value);
        m.state = 'hit';
        m.t = 0;
        if (m.good) this.good(m.x, m.y - this.holeR);
        else this.bad(m.x, m.y - this.holeR, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const R = this.holeR;
    for (const m of this.moles) {
      // Hole
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, R * 1.1, R * 0.38, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#3b2a1e';
      ctx.fill();
      const rise = this.rise(m);
      if (rise > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(m.x - R * 1.5, m.y - R * 3, R * 3, R * 3);
        ctx.clip();
        const cy = m.y + R * 1.2 - rise * R * 1.9;
        this.drawMole(ctx, m, m.x, cy, R);
        ctx.restore();
      }
      // Front lip of the hole, drawn over the mole.
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, R * 1.1, R * 0.38, 0, 0, Math.PI);
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#6b4f3a';
      ctx.stroke();
    }
    this.banner(ctx, `Chỉ đập ${this.rule.label}!`);
  }

  private drawMole(ctx: CanvasRenderingContext2D, m: Mole, x: number, y: number, R: number): void {
    ctx.beginPath();
    ctx.ellipse(x, y, R * 0.8, R * 0.95, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.brown;
    ctx.fill();
    // Eyes (crosses when hit)
    ctx.fillStyle = PALETTE.ink;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 4;
    for (const dx of [-0.28, 0.28]) {
      const ex = x + dx * R;
      const ey = y - R * 0.45;
      if (m.state === 'hit') {
        ctx.beginPath();
        ctx.moveTo(ex - 7, ey - 7);
        ctx.lineTo(ex + 7, ey + 7);
        ctx.moveTo(ex + 7, ey - 7);
        ctx.lineTo(ex - 7, ey + 7);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.arc(x, y - R * 0.22, 8, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.pink;
    ctx.fill();
    // Number sign on the belly
    const signColor = m.state === 'hit' ? (m.good ? PALETTE.green : PALETTE.red) : PALETTE.white;
    panel(ctx, x - R * 0.62, y - R * 0.02, R * 1.24, R * 0.62, 12, signColor, PALETTE.ink, 3);
    text(ctx, String(m.value), x, y + R * 0.3, { size: R * 0.46, color: m.state === 'hit' ? PALETTE.white : PALETTE.ink });
  }
}

export const molesGame: GameDef = {
  id: 'moles',
  title: 'Đập Chuột Chia Hết',
  icon: '🔨',
  topic: 'Chẵn lẻ, dấu hiệu chia hết',
  grades: 'Lớp 1–4',
  howTo: 'Chuột trồi lên mang theo số. Chỉ đập con chuột có số đúng luật! Đập nhầm bị trừ điểm. Cứ 20 giây luật lại đổi.',
  levels: ['Số chẵn, số lẻ', 'Chia hết cho 2, 5, 10', 'Chia hết cho 3, 9'],
  duration: 60,
  versus: true,
  stars: [6, 12, 18],
  color: PALETTE.brown,
  create: (rc) => new MolesRound(rc),
};

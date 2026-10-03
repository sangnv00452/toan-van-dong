import { PALETTE } from '../config';
import { emoji, panel, text } from '../core/draw';
import type { Pointer } from '../core/input';
import { shuffle } from '../math/random';
import { sequenceQuestion, type SequenceQuestion } from '../math/sequences';
import { BaseRound, inCircle, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

const TILE_R = 58;
const STEP_W = 105;
const STEP_H = 85;
const GROUND_Y = 690;

interface Tile {
  value: number;
  x: number;
  y: number;
  touch: TouchTracker;
  used: boolean;
  shake: number;
}

/** Find the pattern and touch the next numbers in order to climb the stairs. */
class StairsRound extends BaseRound {
  private q!: SequenceQuestion;
  private tiles: Tile[] = [];
  private step = 0;
  /** Smoothly animated climber position (0..3 steps). */
  private climber = 0;
  private pending = 0;

  constructor(rc: RoundContext) {
    super(rc);
    this.next();
  }

  private next(): void {
    this.q = sequenceQuestion(this.rc.level);
    this.step = 0;
    this.climber = 0;
    const r = this.region;
    const cells = shuffle([0, 1, 2, 3, 4, 5]);
    const values = [...this.q.next, ...this.q.distractors];
    this.tiles = values.map((value, i) => {
      const c = cells[i];
      return {
        value,
        x: r.x + 590 + (c % 3) * 210 + (Math.random() - 0.5) * 40,
        y: this.top + 200 + Math.floor(c / 3) * 190 + (Math.random() - 0.5) * 40,
        touch: new TouchTracker(),
        used: false,
        shake: 0,
      };
    });
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    this.climber += (this.step - this.climber) * Math.min(1, dt * 8);
    if (this.pending > 0) {
      this.pending -= dt;
      if (this.pending <= 0) this.next();
    }
    for (const t of this.tiles) {
      t.shake = Math.max(0, t.shake - dt);
      const touched = t.touch.check(pointers, (x, y) => inCircle(x, y, t.x, t.y, TILE_R));
      if (!touched || t.used || this.lock > 0 || this.pending > 0) continue;
      if (t.value === this.q.next[this.step]) {
        t.used = true;
        this.step++;
        this.rc.sfx.pop();
        this.rc.fx.burst(t.x, t.y, PALETTE.teal, 16);
        if (this.step === 3) {
          this.good(this.stepX(3), this.stepY(3) - 80);
          this.rc.sfx.cheer();
          this.rc.fx.confetti(this.stepX(3), this.stepY(3));
          this.pending = 1.2;
        }
      } else {
        t.shake = 0.4;
        this.bad(t.x, t.y - TILE_R);
        this.lock = 0.4;
      }
    }
  }

  private stepX(i: number): number {
    return this.region.x + 90 + i * STEP_W;
  }

  private stepY(i: number): number {
    return GROUND_Y - i * STEP_H;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.banner(ctx, 'Tìm quy luật! Chạm các số tiếp theo theo ĐÚNG THỨ TỰ');
    // Sequence row
    const all = [...this.q.shown, ...this.q.next];
    const boxW = 120;
    const startX = this.cx - (6 * boxW + 5 * 16) / 2;
    all.forEach((v, i) => {
      const x = startX + i * (boxW + 16);
      const known = i < 3 || i - 3 < this.step;
      panel(ctx, x, this.top + 14, boxW, 80, 18, known ? 'rgba(255,255,255,0.95)' : 'rgba(29,35,64,0.8)', i < 3 ? PALETTE.blue : PALETTE.teal, 4);
      text(ctx, known ? String(v) : '?', x + boxW / 2, this.top + 56, { size: 40, color: known ? PALETTE.ink : PALETTE.yellow, maxWidth: boxW - 14 });
    });
    // Stairs
    for (let i = 1; i <= 3; i++) {
      panel(ctx, this.stepX(i) - STEP_W / 2, this.stepY(i), STEP_W, GROUND_Y - this.stepY(i) + 30, 8, i <= this.step ? PALETTE.teal : 'rgba(255,255,255,0.8)', PALETTE.ink, 3);
    }
    emoji(ctx, '🏁', this.stepX(3) + 10, this.stepY(3) - 110, 48);
    const k = this.climber;
    const lower = Math.floor(k);
    const hop = Math.sin((k - lower) * Math.PI) * 40;
    const cy = this.stepY(lower) + (this.stepY(Math.min(3, lower + 1)) - this.stepY(lower)) * (k - lower);
    this.buddy.draw(ctx, this.stepX(0) + k * STEP_W, cy - 40 - hop, 0.55);
    // Tiles
    for (const t of this.tiles) {
      if (t.used) continue;
      const dx = t.shake > 0 ? Math.sin(t.shake * 60) * 8 : 0;
      ctx.beginPath();
      ctx.arc(t.x + dx, t.y, TILE_R, 0, Math.PI * 2);
      ctx.fillStyle = t.shake > 0 ? PALETTE.red : PALETTE.purple;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = PALETTE.white;
      ctx.stroke();
      text(ctx, String(t.value), t.x + dx, t.y + 2, { size: 40, maxWidth: TILE_R * 1.7 });
    }
  }
}

export const stairsGame: GameDef = {
  id: 'stairs',
  title: 'Ếch Leo Bậc Quy Luật',
  icon: '🪜',
  topic: 'Dãy số có quy luật',
  grades: 'Lớp 1–4',
  howTo: 'Nhìn 3 số đầu, tìm quy luật. Chạm lần lượt 3 số tiếp theo để ếch Green nhảy lên đỉnh cầu thang!',
  levels: ['Đếm thêm 2, 3, 5, 10', 'Cộng, trừ đều, gấp đôi', 'Khoảng cách tăng dần, gấp ba'],
  duration: 90,
  versus: false,
  stars: [3, 6, 9],
  color: PALETTE.teal,
  create: (rc) => new StairsRound(rc),
};

import { contains, PALETTE, type Rect } from '../config';
import { emoji, panel, text } from '../core/draw';
import type { Pointer } from '../core/input';
import { scaleRound, weightLabel, type ScaleRoundData } from '../math/scale';
import { BaseRound, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

const BEAM_HALF = 290;
const STRING_LEN = 150;
const MAX_TILT = 0.3;

interface WeightButton {
  grams: number | null; // null = "Bỏ bớt" (remove last)
  rect: Rect;
  touch: TouchTracker;
}

/** Add weights to the right pan until the scale balances the mystery box. */
class ScaleRound extends BaseRound {
  private data!: ScaleRoundData;
  private placed: number[] = [];
  private angle = 0;
  private pending = 0;
  private buttons: WeightButton[] = [];
  private readonly pivotX: number;
  private readonly pivotY: number;

  constructor(rc: RoundContext) {
    super(rc);
    this.pivotX = rc.region.x + 470;
    this.pivotY = this.top + 110;
    this.next();
  }

  private next(): void {
    this.data = scaleRound(this.rc.level);
    this.placed = [];
    const r = this.region;
    const options: (number | null)[] = [...this.data.weights, null];
    const h = 74;
    const gap = 12;
    this.buttons = options.map((grams, i) => ({
      grams,
      rect: { x: r.x + r.w - 270, y: this.top + 10 + i * (h + gap), w: 240, h },
      touch: new TouchTracker(),
    }));
  }

  private get total(): number {
    return this.placed.reduce((s, g) => s + g, 0);
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    // Positive angle = right side down (right pan heavier).
    const diff = this.total - this.data.target;
    const want = Math.max(-MAX_TILT, Math.min(MAX_TILT, (diff / this.data.target) * 0.8));
    this.angle += (want - this.angle) * Math.min(1, dt * 6);

    const pressed = this.buttons.filter((b) => b.touch.check(pointers, (x, y) => contains(b.rect, x, y)));
    if (this.pending > 0) {
      this.pending -= dt;
      if (this.pending <= 0) this.next();
      return;
    }
    const b = pressed[0];
    if (!b || this.lock > 0) return;
    this.lock = 0.25;
    if (b.grams === null) {
      this.placed.pop();
      this.rc.sfx.whoosh();
    } else {
      this.placed.push(b.grams);
      this.rc.sfx.pop();
    }
    if (this.total === this.data.target) {
      this.good(this.pivotX, this.pivotY - 40, PALETTE.green);
      this.rc.sfx.cheer();
      this.rc.fx.float(this.pivotX, this.pivotY - 100, 'Thăng bằng rồi!', PALETTE.green, 46);
      this.pending = 1.4;
    }
  }

  private panPos(side: -1 | 1): { x: number; y: number } {
    return {
      x: this.pivotX + Math.cos(this.angle) * BEAM_HALF * side,
      y: this.pivotY + Math.sin(this.angle) * BEAM_HALF * side,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.banner(ctx, 'Thêm quả cân vào đĩa phải để cân THĂNG BẰNG');
    const { pivotX: px, pivotY: py } = this;
    // Stand
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    ctx.moveTo(px - 70, 690);
    ctx.lineTo(px + 70, 690);
    ctx.lineTo(px + 12, py);
    ctx.lineTo(px - 12, py);
    ctx.closePath();
    ctx.fill();
    // Beam
    const l = this.panPos(-1);
    const r = this.panPos(1);
    ctx.lineCap = 'round';
    ctx.lineWidth = 16;
    ctx.strokeStyle = PALETTE.orange;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, 16, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.yellow;
    ctx.fill();
    // Pans
    for (const end of [l, r]) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = PALETTE.ink;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - 80, end.y + STRING_LEN);
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x + 80, end.y + STRING_LEN);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(end.x, end.y + STRING_LEN, 110, 22, 0, 0, Math.PI);
      ctx.fillStyle = '#c0c7d6';
      ctx.fill();
      ctx.stroke();
    }
    this.buddy.draw(ctx, px + 160, 650, 0.7);
    // Mystery box on the left pan
    const boxY = l.y + STRING_LEN;
    emoji(ctx, '📦', l.x, boxY - 50, 96);
    panel(ctx, l.x - 120, boxY + 34, 240, 64, 16, PALETTE.white, PALETTE.purple, 4);
    text(ctx, this.data.label, l.x, boxY + 66, { size: 34, color: PALETTE.purple, maxWidth: 220 });
    // Weights stacked on the right pan
    const panY = r.y + STRING_LEN;
    this.placed.forEach((g, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const wx = r.x - 70 + col * 70;
      const wy = panY - 30 - row * 44;
      panel(ctx, wx - 32, wy - 20, 64, 40, 8, '#7d8597', PALETTE.ink, 2);
      text(ctx, weightLabel(g), wx, wy, { size: 16, color: PALETTE.white });
    });
    // Buttons
    for (const b of this.buttons) {
      const { x, y, w, h } = b.rect;
      const isUndo = b.grams === null;
      panel(ctx, x, y, w, h, 18, isUndo ? PALETTE.red : '#5c677d', PALETTE.white, 4);
      text(ctx, isUndo ? '↩ Bỏ bớt' : `+ ${weightLabel(b.grams ?? 0)}`, x + w / 2, y + h / 2, { size: 34 });
    }
  }
}

export const scaleGame: GameDef = {
  id: 'scale',
  title: 'Ếch Cân Hàng',
  icon: '⚖️',
  topic: 'Khối lượng, đổi kg và g',
  grades: 'Lớp 3–5',
  howTo: 'Ếch Green cần biết chiếc hộp bên trái nặng bao nhiêu. Chạm các nút quả cân bên phải để thêm vào đĩa cho đến khi cân thăng bằng.',
  levels: ['Số kg tròn', 'Ki-lô-gam và gam', 'Viết bằng g, số thập phân'],
  duration: 90,
  versus: false,
  stars: [3, 6, 9],
  color: '#5c677d',
  create: (rc) => new ScaleRound(rc),
};

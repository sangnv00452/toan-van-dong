import { HUD_H, PALETTE } from '../config';
import { panel, text } from '../core/draw';
import type { Pointer } from '../core/input';
import { praise } from '../core/voice';
import { FrogBuddy } from './frog-buddy';
import type { GameRound, RoundContext } from './types';

export const inCircle = (px: number, py: number, cx: number, cy: number, r: number): boolean =>
  (px - cx) ** 2 + (py - cy) ** 2 <= r * r;

/** True if the segment (x1,y1)→(x2,y2) passes within r of (cx,cy). Used for slashing. */
export function segmentHitsCircle(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / len2));
  return inCircle(x1 + t * dx, y1 + t * dy, cx, cy, r);
}

/**
 * Reports a "touch" only when a pointer newly ENTERS an area, so a hand
 * resting on a target counts once, not every frame. Call `check` every frame.
 */
export class TouchTracker {
  private inside = new Set<string>();

  check(pointers: Pointer[], hit: (x: number, y: number) => boolean): boolean {
    let entered = false;
    const now = new Set<string>();
    for (const p of pointers) {
      if (!hit(p.x, p.y)) continue;
      now.add(p.id);
      if (!this.inside.has(p.id)) entered = true;
    }
    this.inside = now;
    return entered;
  }
}

/** Shared helpers for game rounds: a short answer lock, the question banner and Green the helper. */
export abstract class BaseRound implements GameRound {
  /** While > 0 answers are ignored, so one wave cannot answer twice. */
  protected lock = 0;
  protected time = 0;
  /** Green hops on right answers and frowns on wrong ones; each game draws him where he fits. */
  protected readonly buddy = new FrogBuddy();

  constructor(protected readonly rc: RoundContext) {}

  protected get region() {
    return this.rc.region;
  }

  protected get cx(): number {
    return this.rc.region.x + this.rc.region.w / 2;
  }

  /** Top of the play area, just under the question banner. */
  protected get top(): number {
    return HUD_H + 80;
  }

  update(dt: number, pointers: Pointer[]): void {
    this.time += dt;
    if (this.lock > 0) this.lock -= dt;
    this.buddy.update(dt);
    this.tick(dt, pointers);
  }

  protected abstract tick(dt: number, pointers: Pointer[]): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;

  protected banner(ctx: CanvasRenderingContext2D, str: string, color: string = PALETTE.ink): void {
    const r = this.region;
    panel(ctx, r.x + 16, HUD_H + 6, r.w - 32, 64, 20, 'rgba(255,255,255,0.93)');
    text(ctx, str, this.cx, HUD_H + 39, { size: 34, color, maxWidth: r.w - 64 });
  }

  protected good(x: number, y: number, color: string = PALETTE.yellow): void {
    this.rc.addScore(1, x, y);
    this.rc.sfx.correct();
    this.rc.fx.burst(x, y, color, 22);
    this.buddy.cheer();
    praise(() => this.rc.sfx.croak(1.35));
  }

  protected bad(x: number, y: number, penalty = 0): void {
    if (penalty) this.rc.addScore(-penalty, x, y);
    else this.rc.fx.float(x, y, '✗', PALETTE.red, 56);
    this.rc.sfx.wrong();
    this.buddy.frown();
  }
}

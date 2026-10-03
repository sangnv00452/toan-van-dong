import { contains, PALETTE, type Rect } from '../config';
import { emoji, panel, text } from './draw';
import type { InputManager } from './input';

export interface DwellButtonOpts {
  color: string;
  icon?: string;
  sub?: string;
  /** Seconds a hand must stay on the button to press it. */
  dwell?: number;
  size?: number;
  selected?: boolean;
}

/**
 * A button pressed hands-free: hold a finger on it until the bar fills.
 * A mouse click presses it immediately. It only "arms" once no pointer is on
 * it, so a hand left in place after changing screens cannot press it by accident.
 */
export class DwellButton {
  progress = 0;
  private hovered = false;
  private armed = false;

  constructor(
    public rect: Rect,
    public label: string,
    public opts: DwellButtonOpts,
  ) {}

  update(dt: number, input: InputManager): boolean {
    const c = input.click;
    if (c && contains(this.rect, c.x, c.y)) {
      this.progress = 0;
      return true;
    }
    this.hovered = input.pointers.some((p) => contains(this.rect, p.x, p.y));
    if (!this.hovered) this.armed = true;
    if (this.hovered && this.armed) {
      this.progress += dt / (this.opts.dwell ?? 0.9);
      if (this.progress >= 1) {
        this.progress = 0;
        this.armed = false;
        return true;
      }
    } else {
      this.progress = Math.max(0, this.progress - dt * 2);
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, w, h } = this.rect;
    const o = this.opts;
    const top = y - (this.hovered ? 4 : 0);
    panel(ctx, x, y + 6, w, h, 22, 'rgba(0,0,0,0.25)');
    panel(ctx, x, top, w, h, 22, o.color, o.selected ? PALETTE.yellow : 'rgba(255,255,255,0.85)', o.selected ? 8 : 3);
    const size = o.size ?? 32;
    const textX = o.icon ? x + h * 0.95 : x + w / 2;
    const align: CanvasTextAlign = o.icon ? 'left' : 'center';
    const maxWidth = o.icon ? w - h * 1.05 : w - 20;
    if (o.icon) emoji(ctx, o.icon, x + h * 0.5, top + h / 2, Math.min(h * 0.55, 72));
    if (o.sub) {
      text(ctx, this.label, textX, top + h * 0.38, { size, align, maxWidth, outline: 'rgba(0,0,0,0.35)' });
      text(ctx, o.sub, textX, top + h * 0.72, { size: size * 0.55, align, weight: 600, maxWidth, color: 'rgba(255,255,255,0.95)' });
    } else {
      text(ctx, this.label, textX, top + h / 2, { size, align, maxWidth, outline: 'rgba(0,0,0,0.35)' });
    }
    if (this.progress > 0) {
      panel(ctx, x + 12, top + h - 16, (w - 24) * this.progress, 9, 5, PALETTE.yellow);
    }
  }
}

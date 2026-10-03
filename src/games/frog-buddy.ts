import { drawFrog, type FrogOpts } from '../core/frog-art';

const HOP_TIME = 0.55;
const SAD_TIME = 1.2;
const OPEN_TIME = 0.45;
const TONGUE_TIME = 0.35;

/**
 * Green as a little helper inside a game: hops when an answer is right, looks
 * sad when it is wrong, opens his mouth (blowing, shouting) and can flick his
 * tongue at something. Each game decides where to draw him.
 */
export class FrogBuddy {
  private t = 0;
  private hop = 0;
  private sad = 0;
  private open = 0;
  private tongue: { x: number; y: number; t: number } | null = null;

  /** Right answer: a happy hop. */
  cheer(): void {
    this.hop = HOP_TIME;
    this.sad = 0;
  }

  /** Wrong answer: a sad face for a moment. */
  frown(): void {
    this.sad = SAD_TIME;
  }

  /** Mouth open for a moment (blowing a bubble, shouting). */
  puff(): void {
    this.open = OPEN_TIME;
  }

  /** Flick the tongue to an absolute point (catching a bug). */
  lick(x: number, y: number): void {
    this.tongue = { x, y, t: 0 };
  }

  update(dt: number): void {
    this.t += dt;
    this.hop = Math.max(0, this.hop - dt);
    this.sad = Math.max(0, this.sad - dt);
    this.open = Math.max(0, this.open - dt);
    if (this.tongue) {
      this.tongue.t += dt;
      if (this.tongue.t > TONGUE_TIME) this.tongue = null;
    }
  }

  /** Draws Green with his feet near `y + 60 * s`; `extra` adds a look such as the ninja headband. */
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, extra: FrogOpts = {}): void {
    const lift = this.hop > 0 ? Math.sin((1 - this.hop / HOP_TIME) * Math.PI) * 45 * s : 0;
    const fy = y - lift;
    let tongue: { x: number; y: number } | null = null;
    if (this.tongue) {
      const k = Math.sin((this.tongue.t / TONGUE_TIME) * Math.PI);
      tongue = { x: x + (this.tongue.x - x) * k, y: fy + (this.tongue.y - fy) * k };
    }
    drawFrog(ctx, x, fy, s, {
      mood: this.sad > 0 ? 'sad' : this.open > 0 ? 'eat' : 'happy',
      blink: this.t % 3.4 < 0.12,
      look: Math.sin(this.t * 0.9) * 0.7,
      tongue,
      ...extra,
    });
  }
}

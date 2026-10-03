import { H, W } from '../config';

/** A finger tip (from the camera) or the mouse, in canvas coordinates. */
export interface Pointer {
  id: string;
  x: number;
  y: number;
  /** Position at the previous update; the segment px,py → x,y is used for slashing. */
  px: number;
  py: number;
  /** Pixels per second. */
  speed: number;
  source: 'hand' | 'mouse';
}

interface TrackedHand {
  p: Pointer;
  lastSeen: number;
}

/** How far (px) a hand may jump between frames and still be "the same hand". */
const MATCH_DISTANCE = 220;
/** Keep a hand alive briefly when detection flickers, so it does not "re-touch". */
const HAND_GRACE = 0.2;
/** 0..1 — how much each new detection moves the smoothed fingertip. */
const SMOOTHING = 0.65;
/** Seconds without mouse movement before the mouse pointer is ignored. */
const MOUSE_IDLE = 3;

/** Merges camera fingertips and the mouse into one list of pointers. */
export class InputManager {
  pointers: Pointer[] = [];
  /** Mouse/touch click this frame (canvas coords), used as a shortcut for buttons. */
  click: { x: number; y: number } | null = null;
  /** A key was pressed this frame. */
  key = false;

  private hands: TrackedHand[] = [];
  private nextId = 1;
  private time = 0;
  private lastDetect = 0;
  private mouse: Pointer = { id: 'mouse', x: 0, y: 0, px: 0, py: 0, speed: 0, source: 'mouse' };
  private mouseRaw = { x: 0, y: 0 };
  private mouseInside = false;
  private mouseMovedAt = -Infinity;
  private pendingClick: { x: number; y: number } | null = null;
  private pendingKey = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointermove', (e) => this.onMouse(e));
    canvas.addEventListener('pointerdown', (e) => {
      this.onMouse(e);
      this.pendingClick = this.toLogical(e);
    });
    canvas.addEventListener('pointerleave', () => (this.mouseInside = false));
    window.addEventListener('keydown', () => (this.pendingKey = true));
  }

  get handCount(): number {
    return this.hands.length;
  }

  private toLogical(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  }

  private onMouse(e: PointerEvent): void {
    this.mouseRaw = this.toLogical(e);
    this.mouseInside = true;
    this.mouseMovedAt = this.time;
  }

  /** @param tips fingertips of a new camera frame (canvas coords), or null if none arrived. */
  update(dt: number, tips: { x: number; y: number }[] | null): void {
    this.time += dt;
    this.click = this.pendingClick;
    this.pendingClick = null;
    this.key = this.pendingKey;
    this.pendingKey = false;

    if (tips) {
      this.matchHands(tips);
    } else {
      for (const h of this.hands) {
        h.p.px = h.p.x;
        h.p.py = h.p.y;
      }
      this.hands = this.hands.filter((h) => this.time - h.lastSeen < HAND_GRACE + 0.1);
    }

    const m = this.mouse;
    m.px = m.x;
    m.py = m.y;
    m.x = this.mouseRaw.x;
    m.y = this.mouseRaw.y;
    m.speed = dt > 0 ? Math.hypot(m.x - m.px, m.y - m.py) / dt : 0;
    const mouseActive = this.mouseInside && this.time - this.mouseMovedAt < MOUSE_IDLE;

    this.pointers = this.hands.map((h) => h.p);
    if (mouseActive) this.pointers.push(m);
  }

  /** Gives each fingertip a stable id by pairing it with the nearest hand of the last frame. */
  private matchHands(tips: { x: number; y: number }[]): void {
    const detectDt = Math.max(this.time - this.lastDetect, 1 / 60);
    this.lastDetect = this.time;
    const unmatched = new Set(this.hands);
    const next: TrackedHand[] = [];

    for (const tip of tips) {
      let best: TrackedHand | null = null;
      let bestDist = MATCH_DISTANCE;
      for (const h of unmatched) {
        const d = Math.hypot(h.p.x - tip.x, h.p.y - tip.y);
        if (d < bestDist) {
          best = h;
          bestDist = d;
        }
      }
      if (best) {
        unmatched.delete(best);
        const p = best.p;
        p.px = p.x;
        p.py = p.y;
        p.x += (tip.x - p.x) * SMOOTHING;
        p.y += (tip.y - p.y) * SMOOTHING;
        p.speed = Math.hypot(p.x - p.px, p.y - p.py) / detectDt;
        best.lastSeen = this.time;
        next.push(best);
      } else {
        const id = `hand-${this.nextId++}`;
        next.push({ p: { id, x: tip.x, y: tip.y, px: tip.x, py: tip.y, speed: 0, source: 'hand' }, lastSeen: this.time });
      }
    }
    for (const h of unmatched) {
      if (this.time - h.lastSeen < HAND_GRACE) {
        h.p.px = h.p.x;
        h.p.py = h.p.y;
        next.push(h);
      }
    }
    this.hands = next;
  }
}

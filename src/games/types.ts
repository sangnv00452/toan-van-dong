import type { Level, Rect } from '../config';
import type { Sfx } from '../core/audio';
import type { Effects } from '../core/effects';
import type { Pointer } from '../core/input';

/** Everything a game round needs from the play screen. */
export interface RoundContext {
  /** Screen area this round owns (whole screen, or one half in 2-player mode). */
  region: Rect;
  level: Level;
  fx: Effects;
  sfx: Sfx;
  /** Adds (or removes) points and shows a floating "+1"/"-1" at x,y. */
  addScore(delta: number, x: number, y: number): void;
}

/** One running game for one player. */
export interface GameRound {
  /** `pointers` only contains pointers inside this round's region. */
  update(dt: number, pointers: Pointer[]): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface GameDef {
  id: string;
  title: string;
  icon: string;
  /** Math topic, shown on the menu card. */
  topic: string;
  grades: string;
  howTo: string;
  /** What each level (Dễ, Vừa, Khó) practises. */
  levels: [string, string, string];
  /** Seconds per game. */
  duration: number;
  /** Supports the split-screen 2-player mode. */
  versus: boolean;
  /** Scores needed for 1, 2 and 3 stars. */
  stars: [number, number, number];
  color: string;
  create(rc: RoundContext): GameRound;
}

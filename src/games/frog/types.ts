import type { Rect } from '../../config';
import type { Sfx } from '../../core/audio';
import type { Effects } from '../../core/effects';
import type { Pointer } from '../../core/input';
import type { Difficulty } from '../../math/grade5';

/** What a Math Frog challenge round gets from the challenge screen. */
export interface ChallengeContext {
  region: Rect;
  difficulty: Difficulty;
  /** 1..5 inside the difficulty. */
  level: number;
  fx: Effects;
  sfx: Sfx;
  /** Counts one correct answer and shows "+1" at x,y. */
  correct(x: number, y: number): void;
  /** Counts one wrong answer and shows "✗" at x,y. */
  wrong(x: number, y: number): void;
  /** Ends the level as not cleared (e.g. Green fell into the water). */
  fail(reason: string): void;
}

export interface ChallengeRound {
  update(dt: number, pointers: Pointer[]): void;
  draw(ctx: CanvasRenderingContext2D): void;
  /** Where Green is now, so the challenge screen can put his speech bubble next to him. */
  frog(): { x: number; y: number };
}

/** One Math Frog practice game: 3 difficulties × 5 levels, each level a challenge. */
export interface FrogGameDef {
  id: string;
  title: string;
  icon: string;
  color: string;
  howTo: string;
  /** Icon shown next to the goal counter, e.g. "🍎 5/8". */
  goalIcon: string;
  /** Correct answers needed to clear the level. */
  goal(d: Difficulty, level: number): number;
  /** Seconds allowed, or null when there is no clock. */
  timeLimit(d: Difficulty, level: number): number | null;
  /** The challenge in words, e.g. "Ăn đúng 8 quả táo trong 60 giây". */
  goalText(d: Difficulty, level: number): string;
  create(cc: ChallengeContext): ChallengeRound;
}

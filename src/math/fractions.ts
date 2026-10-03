import type { Level } from '../config';
import { pick, randInt } from './random';

export interface Fraction {
  n: number;
  d: number;
}

export const equalFractions = (a: Fraction, b: Fraction): boolean => a.n * b.d === b.n * a.d;

const TARGETS: Record<Level, Fraction[]> = {
  1: [{ n: 1, d: 2 }],
  2: [
    { n: 1, d: 2 },
    { n: 1, d: 3 },
    { n: 2, d: 3 },
    { n: 1, d: 4 },
    { n: 3, d: 4 },
  ],
  3: [
    { n: 2, d: 3 },
    { n: 3, d: 4 },
    { n: 2, d: 5 },
    { n: 3, d: 5 },
    { n: 4, d: 5 },
    { n: 5, d: 6 },
    { n: 3, d: 8 },
    { n: 5, d: 8 },
  ],
};

export const pickTarget = (level: Level): Fraction => pick(TARGETS[level]);

/** Same value, different look: 1/2 → 3/6. */
export function equivalentFraction(t: Fraction): Fraction {
  const k = randInt(1, 6);
  return { n: t.n * k, d: t.d * k };
}

/** Looks almost the same but is NOT equal: 3/6 → 3/7 or 4/6. */
export function nonEquivalentFraction(t: Fraction): Fraction {
  for (;;) {
    const k = randInt(1, 6);
    const f = { n: t.n * k, d: t.d * k };
    if (randInt(0, 1) === 0) f.n += pick([1, -1]);
    else f.d += pick([1, -1]);
    if (f.n >= 1 && f.d > f.n && !equalFractions(f, t)) return f;
  }
}

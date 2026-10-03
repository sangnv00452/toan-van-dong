import type { Level } from '../config';
import { pick, randInt, shuffle } from './random';

export interface SequenceQuestion {
  /** First 3 terms shown to the player. */
  shown: number[];
  /** The 3 terms the player must touch, in order. */
  next: number[];
  /** Wrong tiles mixed in with the right ones. */
  distractors: number[];
}

function build(first: number, step: (prev: number, i: number) => number): number[] {
  const terms = [first];
  for (let i = 1; i < 6; i++) terms.push(step(terms[i - 1], i));
  return terms;
}

function terms(level: Level): number[] {
  if (level === 1) {
    const d = pick([2, 3, 4, 5, 10]);
    return build(randInt(1, 20), (p) => p + d);
  }
  if (level === 2) {
    const kind = randInt(0, 2);
    if (kind === 0) {
      const d = randInt(6, 15);
      return build(randInt(1, 30), (p) => p + d);
    }
    if (kind === 1) {
      const d = randInt(3, 9);
      return build(d * 6 + randInt(1, 20), (p) => p - d);
    }
    return build(randInt(1, 5), (p) => p * 2);
  }
  const kind = randInt(0, 2);
  if (kind === 0) {
    const d0 = randInt(1, 3);
    return build(randInt(1, 10), (p, i) => p + d0 + i - 1);
  }
  if (kind === 1) return build(randInt(1, 3), (p) => p * 3);
  const d = randInt(11, 25);
  return build(randInt(10, 60), (p) => p + d);
}

/** Dễ: đếm thêm · Vừa: cộng/trừ đều, gấp đôi · Khó: khoảng cách tăng dần, gấp ba. */
export function sequenceQuestion(level: Level): SequenceQuestion {
  const all = terms(level);
  const shown = all.slice(0, 3);
  const next = all.slice(3);
  const distractors: number[] = [];
  for (const c of shuffle(next.flatMap((v) => [v + 1, v - 1, v + 2, v - 2, v + 10]))) {
    if (distractors.length < 3 && c > 0 && !all.includes(c) && !distractors.includes(c)) distractors.push(c);
  }
  return { shown, next, distractors };
}

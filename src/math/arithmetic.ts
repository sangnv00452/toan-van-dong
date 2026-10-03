import type { Level } from '../config';
import { chance, pick, randInt, shuffle } from './random';

export interface ChoiceQuestion {
  text: string;
  answer: number;
  /** All choices (answer included), shuffled and distinct. */
  options: number[];
}

/**
 * Builds `count` distinct non-negative options: the answer plus believable
 * wrong ones (taken from `candidates` first — typical mistakes — then ±1, ±2…).
 */
export function makeOptions(answer: number, candidates: number[], count = 3): number[] {
  const wrong: number[] = [];
  const accept = (c: number) => {
    if (wrong.length < count - 1 && c >= 0 && c !== answer && !wrong.includes(c)) wrong.push(c);
  };
  shuffle(candidates).forEach(accept);
  for (let k = 1; wrong.length < count - 1; k++) {
    accept(answer + k);
    accept(answer - k);
  }
  return shuffle([answer, ...wrong]);
}

function addSub(): ChoiceQuestion {
  if (chance(0.5)) {
    const a = randInt(10, 89);
    const b = randInt(2, 99 - a);
    const answer = a + b;
    return { text: `${a} + ${b} = ?`, answer, options: makeOptions(answer, [answer + 1, answer - 1, answer + 10, answer - 10]) };
  }
  const a = randInt(20, 99);
  const b = randInt(2, a - 1);
  const answer = a - b;
  return { text: `${a} − ${b} = ?`, answer, options: makeOptions(answer, [answer + 1, answer - 1, answer + 10, answer - 10]) };
}

function timesTable(): ChoiceQuestion {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const answer = a * b;
  // Typical slips: one row up/down in the table, or off by one.
  return { text: `${a} × ${b} = ?`, answer, options: makeOptions(answer, [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, answer + 1]) };
}

function division(): ChoiceQuestion {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  return { text: `${a * b} : ${a} = ?`, answer: b, options: makeOptions(b, [b + 1, b - 1, b + 2, a]) };
}

function twoDigitTimesOne(): ChoiceQuestion {
  const a = randInt(12, 49);
  const b = randInt(2, 9);
  const answer = a * b;
  return { text: `${a} × ${b} = ?`, answer, options: makeOptions(answer, [answer + 10, answer - 10, answer + b, answer - b]) };
}

/** Dễ: cộng trừ trong 100 · Vừa: bảng nhân · Khó: nhân, chia, nhân số có 2 chữ số. */
export function arithmeticQuestion(level: Level): ChoiceQuestion {
  if (level === 1) return addSub();
  if (level === 2) return timesTable();
  return pick([timesTable, division, twoDigitTimesOne])();
}

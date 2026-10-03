import type { Level } from '../config';
import { pick, randInt } from './random';

export interface DivRule {
  label: string;
  test: (n: number) => boolean;
  min: number;
  max: number;
}

const RULES: Record<Level, DivRule[]> = {
  1: [
    { label: 'SỐ CHẴN', test: (n) => n % 2 === 0, min: 1, max: 50 },
    { label: 'SỐ LẺ', test: (n) => n % 2 === 1, min: 1, max: 50 },
  ],
  2: [
    { label: 'SỐ CHIA HẾT CHO 2', test: (n) => n % 2 === 0, min: 10, max: 99 },
    { label: 'SỐ CHIA HẾT CHO 5', test: (n) => n % 5 === 0, min: 10, max: 99 },
    { label: 'SỐ CHIA HẾT CHO 10', test: (n) => n % 10 === 0, min: 10, max: 99 },
  ],
  3: [
    { label: 'SỐ CHIA HẾT CHO 3', test: (n) => n % 3 === 0, min: 10, max: 199 },
    { label: 'SỐ CHIA HẾT CHO 9', test: (n) => n % 9 === 0, min: 10, max: 199 },
    { label: 'SỐ CHIA HẾT CHO CẢ 2 VÀ 5', test: (n) => n % 10 === 0, min: 10, max: 199 },
  ],
};

/** A rule for this level, different from `except` when possible. */
export function pickRule(level: Level, except?: DivRule): DivRule {
  const options = RULES[level].filter((r) => r !== except);
  return pick(options.length ? options : RULES[level]);
}

/** A number that does (or does not) follow the rule. */
export function numberForRule(rule: DivRule, wantMatch: boolean): number {
  for (;;) {
    const n = randInt(rule.min, rule.max);
    if (rule.test(n) === wantMatch) return n;
  }
}

import type { Level } from '../config';
import { UNIT_COMPARISONS } from '../data/unit-comparisons';
import { formatDecimal, formatNumber } from './format';
import { chance, pick, randInt } from './random';

export interface CompareQuestion {
  left: string;
  right: string;
  leftValue: number;
  rightValue: number;
}

type Side = { label: string; value: number };

/** Two 4-digit numbers that differ by a swapped digit or one place value. */
function naturalPair(): [Side, Side] {
  const n = randInt(1000, 9999);
  let m = n;
  while (m === n) {
    if (chance(0.5)) {
      const digits = String(n).split('');
      const i = randInt(0, 2);
      [digits[i], digits[i + 1]] = [digits[i + 1], digits[i]];
      m = Number(digits.join(''));
    } else {
      m = n + pick([1, 10, 100, 1000]) * pick([1, -1]);
    }
    if (m < 1000 || m > 99999) m = n;
  }
  return [
    { label: formatNumber(n), value: n },
    { label: formatNumber(m), value: m },
  ];
}

/** Classic trap: 3,5 vs 3,45 (more digits does not mean bigger). Values in hundredths. */
function decimalPair(): [Side, Side] {
  const whole = randInt(0, 9);
  for (;;) {
    const tenths = randInt(1, 9);
    const hundredths = randInt(10, 99);
    const a = whole * 100 + tenths * 10;
    const b = whole * 100 + hundredths;
    if (a !== b) return [{ label: formatDecimal(whole * 10 + tenths, 1), value: a }, { label: formatDecimal(b, 2), value: b }];
  }
}

/** Fractions with the same denominator, the same numerator, or neither. */
function fractionPair(): [Side, Side] {
  for (;;) {
    let n1: number, d1: number, n2: number, d2: number;
    const kind = randInt(0, 2);
    if (kind === 0) {
      d1 = d2 = randInt(3, 12);
      n1 = randInt(1, d1 - 1);
      n2 = randInt(1, d1 - 1);
    } else if (kind === 1) {
      n1 = n2 = randInt(1, 5);
      d1 = randInt(n1 + 1, 12);
      d2 = randInt(n1 + 1, 12);
    } else {
      d1 = randInt(2, 9);
      d2 = randInt(2, 9);
      n1 = randInt(1, d1 - 1);
      n2 = randInt(1, d2 - 1);
    }
    if (n1 * d2 !== n2 * d1) {
      return [
        { label: `${n1}/${d1}`, value: n1 / d1 },
        { label: `${n2}/${d2}`, value: n2 / d2 },
      ];
    }
  }
}

function unitPair(): [Side, Side] {
  const u = pick(UNIT_COMPARISONS);
  return [
    { label: u.a, value: u.va },
    { label: u.b, value: u.vb },
  ];
}

/** Dễ: số tự nhiên · Vừa: số thập phân, phân số · Khó: đổi đơn vị đo. */
export function compareQuestion(level: Level): CompareQuestion {
  const pair =
    level === 1 ? naturalPair() : level === 2 ? pick([decimalPair, fractionPair])() : chance(0.75) ? unitPair() : pick([decimalPair, fractionPair])();
  const [l, r] = chance(0.5) ? pair : [pair[1], pair[0]];
  return { left: l.label, right: r.label, leftValue: l.value, rightValue: r.value };
}

import { describe, expect, it } from 'vitest';
import type { Level } from '../src/config';
import { UNIT_COMPARISONS } from '../src/data/unit-comparisons';
import { arithmeticQuestion, makeOptions } from '../src/math/arithmetic';
import { clockQuestion, minuteToNumber, to12 } from '../src/math/clock';
import { compareQuestion } from '../src/math/compare';
import { numberForRule, pickRule } from '../src/math/divisibility';
import { formatDecimal, formatMoney, formatNumber } from '../src/math/format';
import { equalFractions, equivalentFraction, nonEquivalentFraction, pickTarget } from '../src/math/fractions';
import { formatKgDecimal, formatMass, scaleRound } from '../src/math/scale';
import { sequenceQuestion } from '../src/math/sequences';
import { keeperRule } from '../src/math/shapes';
import { priceStep, shopRound } from '../src/math/shop';

const LEVELS: Level[] = [1, 2, 3];
const RUNS = 400;

/** Evaluates "12 × 3 = ?" style question text. */
function evalQuestion(text: string): number {
  const expr = text.replace(' = ?', '').replace('×', '*').replace('−', '-').replace(':', '/');
  return Function(`return (${expr});`)() as number;
}

/** "4 567" / "3,45" → number. */
const parseVi = (s: string): number => Number(s.replace(/ /g, '').replace(',', '.'));

describe('format', () => {
  it('formats numbers, money and decimals the Vietnamese way', () => {
    expect(formatNumber(1234567)).toBe('1 234 567');
    expect(formatMoney(20000)).toBe('20 000 đ');
    expect(formatDecimal(345, 2)).toBe('3,45');
    expect(formatDecimal(35, 1)).toBe('3,5');
    expect(formatDecimal(5, 2)).toBe('0,05');
  });
});

describe('arithmetic', () => {
  it('makeOptions returns distinct non-negative options containing the answer', () => {
    for (let i = 0; i < RUNS; i++) {
      const opts = makeOptions(1, [1, 0, -1, 2]);
      expect(opts).toContain(1);
      expect(new Set(opts).size).toBe(3);
      expect(opts.every((o) => o >= 0)).toBe(true);
    }
  });

  it.each(LEVELS)('level %i questions have correct answers and 3 distinct options', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const q = arithmeticQuestion(level);
      expect(evalQuestion(q.text)).toBe(q.answer);
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(3);
      expect(q.options.every((o) => Number.isInteger(o) && o >= 0)).toBe(true);
    }
  });
});

describe('compare', () => {
  it('unit bank never contains equal values', () => {
    for (const u of UNIT_COMPARISONS) expect(u.va).not.toBe(u.vb);
  });

  it.each(LEVELS)('level %i pairs are never equal', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const q = compareQuestion(level);
      expect(q.leftValue).not.toBe(q.rightValue);
      expect(q.left).not.toBe(q.right);
    }
  });

  it('shown numbers and decimals match their values', () => {
    for (let i = 0; i < RUNS; i++) {
      const q = compareQuestion(1);
      expect(parseVi(q.left)).toBe(q.leftValue);
      const d = compareQuestion(2);
      for (const [label, v] of [
        [d.left, d.leftValue],
        [d.right, d.rightValue],
      ] as const) {
        if (label.includes('/')) {
          const [n, den] = label.split('/').map(Number);
          expect(n / den).toBeCloseTo(v, 10);
        } else {
          expect(Math.round(parseVi(label) * 100)).toBe(v);
        }
      }
    }
  });
});

describe('divisibility', () => {
  it.each(LEVELS)('level %i numbers follow (or break) the rule as asked', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const rule = pickRule(level);
      const want = i % 2 === 0;
      const n = numberForRule(rule, want);
      expect(rule.test(n)).toBe(want);
      expect(n).toBeGreaterThanOrEqual(rule.min);
      expect(n).toBeLessThanOrEqual(rule.max);
    }
  });

  it('pickRule avoids the previous rule when it can', () => {
    const first = pickRule(3);
    for (let i = 0; i < 50; i++) expect(pickRule(3, first)).not.toBe(first);
  });
});

describe('fractions', () => {
  it.each(LEVELS)('level %i: equivalent and non-equivalent fractions are what they claim', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const t = pickTarget(level);
      expect(equalFractions(equivalentFraction(t), t)).toBe(true);
      const wrong = nonEquivalentFraction(t);
      expect(equalFractions(wrong, t)).toBe(false);
      expect(wrong.n).toBeGreaterThanOrEqual(1);
      expect(wrong.d).toBeGreaterThan(wrong.n);
    }
  });
});

describe('sequences', () => {
  it.each(LEVELS)('level %i: 3 shown + 3 next terms, distractors are distinct and wrong', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const q = sequenceQuestion(level);
      expect(q.shown).toHaveLength(3);
      expect(q.next).toHaveLength(3);
      expect(q.distractors).toHaveLength(3);
      const all = [...q.shown, ...q.next];
      expect(all.every((v) => v > 0)).toBe(true);
      expect(new Set(q.next).size).toBe(3);
      for (const d of q.distractors) {
        expect(d).toBeGreaterThan(0);
        expect(all).not.toContain(d);
      }
      expect(new Set(q.distractors).size).toBe(3);
    }
  });
});

describe('clock', () => {
  it('helpers', () => {
    expect(to12(13)).toBe(1);
    expect(to12(12)).toBe(12);
    expect(to12(24)).toBe(12);
    expect(minuteToNumber(0)).toBe(12);
    expect(minuteToNumber(15)).toBe(3);
  });

  it.each(LEVELS)('level %i answers match the revealed time', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const q = clockQuestion(level);
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(12);
      const asksHour = q.lines.join(' ').includes('kim NGẮN');
      if (asksHour) expect(q.answer).toBe(to12(q.reveal.h));
      else expect(q.answer).toBe(minuteToNumber(q.reveal.m));
    }
  });
});

describe('shop', () => {
  /** True if some items add up exactly to the target. */
  const solvable = (prices: number[], target: number): boolean => {
    for (let mask = 1; mask < 1 << prices.length; mask++) {
      const sum = prices.reduce((s, p, i) => (mask & (1 << i) ? s + p : s), 0);
      if (sum === target) return true;
    }
    return false;
  };

  it.each(LEVELS)('level %i rounds are always solvable with rounded prices', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const r = shopRound(level);
      expect(r.items).toHaveLength(6);
      expect(r.items.every((it) => it.price > 0 && it.price % priceStep(level) === 0)).toBe(true);
      expect(solvable(r.items.map((it) => it.price), r.target)).toBe(true);
    }
  });
});

describe('scale', () => {
  it('formats masses', () => {
    expect(formatMass(3200)).toBe('3 kg 200 g');
    expect(formatMass(3000)).toBe('3 kg');
    expect(formatMass(450)).toBe('450 g');
    expect(formatKgDecimal(2350)).toBe('2,35 kg');
    expect(formatKgDecimal(2500)).toBe('2,5 kg');
    expect(formatKgDecimal(2050)).toBe('2,05 kg');
  });

  it.each(LEVELS)('level %i targets can be balanced with the given weights', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const r = scaleRound(level);
      // Unlimited weights of each size: coin-change reachability.
      const reach = new Array<boolean>(r.target + 1).fill(false);
      reach[0] = true;
      for (let g = 1; g <= r.target; g++) reach[g] = r.weights.some((w) => w <= g && reach[g - w]);
      expect(reach[r.target]).toBe(true);
    }
  });
});

describe('goalkeeper shapes', () => {
  it.each(LEVELS)('level %i: correct balls match the rule, wrong ones do not', (level) => {
    for (let i = 0; i < RUNS; i++) {
      const rule = keeperRule(level);
      expect(rule.matches(rule.make(true))).toBe(true);
      expect(rule.matches(rule.make(false))).toBe(false);
    }
  });
});

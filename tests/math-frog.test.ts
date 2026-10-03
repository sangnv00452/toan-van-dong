import { describe, expect, it } from 'vitest';
import { isUnlocked, type KeyValueStore, Progress, RANKS, rankIndex, rankProgress, xpFor } from '../src/core/progress';
import { CHAPTERS } from '../src/data/lessons';
import { FROG_GAMES } from '../src/games/frog/registry';
import { isCorrectAnswer, parseAnswer } from '../src/math/answer-check';
import { type Difficulty, formatUnits, grade5Question, LEVELS_PER_DIFFICULTY, levelTopic } from '../src/math/grade5';

const DIFFS: Difficulty[] = [1, 2, 3];
const RUNS = 300;

/** Evaluates the arithmetic part of "2,5 × 4 = ?" style questions. */
function evalArithmetic(text: string): number | null {
  const m = /^([\d,]+) ([+−×:]) ([\d,]+) = \?$/.exec(text);
  if (!m) return null;
  const a = Number(m[1].replace(',', '.'));
  const b = Number(m[3].replace(',', '.'));
  const results: Record<string, number> = { '+': a + b, '−': a - b, '×': a * b, ':': a / b };
  return results[m[2]] ?? null;
}

describe('grade 5 questions', () => {
  it('formats decimal units without trailing zeros', () => {
    expect(formatUnits(250, 2)).toBe('2,5');
    expect(formatUnits(300, 2)).toBe('3');
    expect(formatUnits(5, 3)).toBe('0,005');
    expect(formatUnits(12500, 0)).toBe('12 500');
  });

  it('always has distinct options that include the answer', () => {
    for (const d of DIFFS) {
      for (let level = 1; level <= LEVELS_PER_DIFFICULTY; level++) {
        for (let i = 0; i < RUNS; i++) {
          const count = i % 2 ? 3 : 4;
          const q = grade5Question(d, level, count);
          expect(q.options).toHaveLength(count);
          expect(new Set(q.options).size).toBe(count);
          expect(q.options).toContain(q.answer);
          for (const o of q.options) expect(parseAnswer(o), `${q.text} → ${o}`).not.toBeNull();
        }
      }
    }
  });

  it('computes plain arithmetic answers correctly', () => {
    for (const d of DIFFS) {
      for (let level = 1; level <= LEVELS_PER_DIFFICULTY; level++) {
        for (let i = 0; i < RUNS; i++) {
          const q = grade5Question(d, level);
          const expected = evalArithmetic(q.text);
          if (expected !== null) expect(parseAnswer(q.answer), q.text).toBeCloseTo(expected, 9);
        }
      }
    }
  });

  it('checks word-problem answers with the textbook formulas', () => {
    for (let i = 0; i < RUNS; i++) {
      const q = grade5Question(3, 1 + (i % 4));
      const n = [...q.text.matchAll(/\d+/g)].map((m) => Number(m[0]));
      const ans = parseAnswer(q.answer);
      if (q.text.startsWith('Tam giác')) expect(ans).toBe((n[0] * n[1]) / 2);
      else if (q.text.startsWith('Hình thang')) expect(ans).toBe(((n[0] + n[1]) * n[2]) / 2);
      else if (q.text.startsWith('Hộp')) expect(ans).toBe(n[0] * n[1] * n[2]);
      else if (q.text.includes('Vận tốc =')) expect(ans).toBe(n[0] / n[1]);
      else if (q.text.includes('Quãng đường =')) expect(ans).toBe(n[0] * n[1]);
      else if (q.text.includes('Thời gian =')) expect(ans).toBe(n[0] / n[1]);
    }
  });

  it('gives each level a topic; level 5 mixes', () => {
    expect(levelTopic(1, 1)).toBe('Cộng số thập phân');
    expect(levelTopic(2, 5)).toBe('Trộn cả 4 dạng');
  });
});

describe('typed answers', () => {
  it('accepts comma, dot and trailing zeros', () => {
    expect(isCorrectAnswer('2,5', '2,5')).toBe(true);
    expect(isCorrectAnswer('2.50', '2,5')).toBe(true);
    expect(isCorrectAnswer(' 17,5 ', '17,5')).toBe(true);
    expect(isCorrectAnswer('2,05', '2,5')).toBe(false);
    expect(isCorrectAnswer('', '0')).toBe(false);
    expect(isCorrectAnswer('2,', '2')).toBe(false);
  });
});

describe('lessons content', () => {
  it('has 4 chapters, each topic with theory, examples and number answers', () => {
    expect(CHAPTERS).toHaveLength(4);
    const ids = new Set<string>();
    for (const c of CHAPTERS) {
      expect(c.topics.length).toBeGreaterThan(0);
      for (const t of c.topics) {
        expect(ids.has(t.id), t.id).toBe(false);
        ids.add(t.id);
        expect(t.theory.length).toBeGreaterThan(0);
        expect(t.examples.length).toBeGreaterThan(0);
        expect(t.exercises.length).toBeGreaterThan(0);
        for (const e of t.exercises) expect(parseAnswer(e.answer), `${t.id}: ${e.q}`).not.toBeNull();
      }
    }
  });
});

describe('KN and ranks', () => {
  it('gives 10 KN per correct answer plus a clear bonus', () => {
    expect(xpFor(7)).toBe(70);
    expect(xpFor(7, true)).toBe(90);
  });

  it('finds the rank and progress to the next one', () => {
    expect(rankIndex(0)).toBe(0);
    expect(rankIndex(99)).toBe(0);
    expect(rankIndex(100)).toBe(1);
    expect(rankIndex(99999)).toBe(RANKS.length - 1);
    expect(rankProgress(200)).toBeCloseTo(0.5);
    expect(rankProgress(99999)).toBe(1);
  });

  it('unlocks levels one by one', () => {
    expect(isUnlocked(0, 1)).toBe(true);
    expect(isUnlocked(0, 2)).toBe(false);
    expect(isUnlocked(2, 3)).toBe(true);
  });

  it('saves and reloads progress', () => {
    const data = new Map<string, string>();
    const store: KeyValueStore = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
    const p = new Progress(store);
    expect(p.addXp(120)).toBe(true);
    p.markCleared('apple-catch', 2, 3);
    p.markCleared('apple-catch', 2, 1);
    p.saveLesson('decimals-intro', 3);
    p.muted = true;
    const again = new Progress(store);
    expect(again.xp).toBe(120);
    expect(again.clearedUpTo('apple-catch', 2)).toBe(3);
    expect(again.clearedUpTo('apple-catch', 1)).toBe(0);
    expect(again.lessonBest('decimals-intro')).toBe(3);
    expect(again.muted).toBe(true);
  });
});

describe('Math Frog games', () => {
  it('have sensible goals for every level', () => {
    expect(FROG_GAMES.map((g) => g.id)).toEqual(['apple-catch', 'lily-jump', 'frozen-apple']);
    for (const g of FROG_GAMES) {
      for (const d of DIFFS) {
        for (let level = 1; level <= LEVELS_PER_DIFFICULTY; level++) {
          expect(g.goal(d, level)).toBeGreaterThan(0);
          expect(g.goalText(d, level)).toContain(String(g.goal(d, level)));
        }
      }
    }
  });
});

describe('lesson pictures', () => {
  it('has an animated picture for every theory page', async () => {
    const { ART } = await import('../src/scenes/lesson-art');
    for (const c of CHAPTERS) {
      for (const t of c.topics) expect(ART[t.id]?.length, t.id).toBe(t.theory.length);
    }
  });
});

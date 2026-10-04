import { describe, expect, it } from 'vitest';
import coverageJson from '../scripts/emoji-font-coverage.json?raw';

// Every source file whose text can reach the screen.
const sources = import.meta.glob(['../src/**/*.ts', '../index.html', '../presentation/*.html'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const covered = new Set<number>(JSON.parse(coverageJson) as number[]);

describe('bundled emoji font', () => {
  it('covers every emoji used in the game, so old Windows never shows empty boxes', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
    const missing = new Map<string, string>();
    for (const [file, content] of Object.entries(sources)) {
      for (const ch of content) {
        const cp = ch.codePointAt(0) ?? 0;
        if (cp > 0xff && /\p{Extended_Pictographic}/u.test(ch) && !covered.has(cp)) missing.set(ch, file);
      }
    }
    // Fix: run `npm run emoji-font` to rebuild public/fonts/math-frog-emoji.woff.
    expect([...missing].map(([ch, file]) => `${ch} (${file})`)).toEqual([]);
  });

  it('includes the newer emoji that Windows 10 cannot draw', () => {
    for (const ch of ['🪷', '🫧', '🥷', '🪜']) expect(covered.has(ch.codePointAt(0) ?? 0)).toBe(true);
  });
});

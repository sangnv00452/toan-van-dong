/** Typed answer → number. Accepts "2,5", "2.5", "1 200"; returns null for anything else. */
export function parseAnswer(input: string): number | null {
  const t = input.replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/** True when the typed answer equals the expected one ("2,50" counts as "2,5"). */
export function isCorrectAnswer(input: string, expected: string): boolean {
  const a = parseAnswer(input);
  const b = parseAnswer(expected);
  return a !== null && b !== null && Math.abs(a - b) < 1e-9;
}

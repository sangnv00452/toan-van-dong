/** Random whole number between min and max (both included). */
export const randInt = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1));

export const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export const chance = (p: number): boolean => Math.random() < p;

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

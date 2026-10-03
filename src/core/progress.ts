/**
 * Experience points (KN), rank, cleared levels and finished lessons.
 * Saved in the browser of this computer only (localStorage); nothing is sent anywhere.
 */

export interface Rank {
  name: string;
  icon: string;
  /** KN needed to reach this rank. */
  min: number;
}

export const RANKS: Rank[] = [
  { name: 'Nòng nọc', icon: '💧', min: 0 },
  { name: 'Ếch con', icon: '🌱', min: 100 },
  { name: 'Ếch xanh', icon: '🍀', min: 300 },
  { name: 'Ếch bạc', icon: '🥈', min: 600 },
  { name: 'Ếch vàng', icon: '🥇', min: 1000 },
  { name: 'Vua ếch', icon: '👑', min: 1600 },
];

export const XP_PER_CORRECT = 10;
/** Extra KN for clearing a practice level. */
export const XP_CLEAR_BONUS = 20;

export const xpFor = (correct: number, cleared = false): number => correct * XP_PER_CORRECT + (cleared ? XP_CLEAR_BONUS : 0);

export function rankIndex(xp: number): number {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].min) i++;
  return i;
}

/** 0..1 progress from the current rank to the next (1 at the top rank). */
export function rankProgress(xp: number): number {
  const i = rankIndex(xp);
  if (i === RANKS.length - 1) return 1;
  return (xp - RANKS[i].min) / (RANKS[i + 1].min - RANKS[i].min);
}

/** Level 1 is always open; level n opens once level n-1 is cleared. */
export const isUnlocked = (clearedUpTo: number, level: number): boolean => level <= clearedUpTo + 1;

interface SaveData {
  xp: number;
  /** "gameId:difficulty" → highest cleared level (0 = none). */
  cleared: Record<string, number>;
  /** Lesson topic id → best number of correct exercises. */
  lessons: Record<string, number>;
  muted: boolean;
}

/** The subset of `Storage` we use, so tests can pass a fake. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const KEY = 'math-frog-progress-v1';

function browserStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export class Progress {
  private data: SaveData = { xp: 0, cleared: {}, lessons: {}, muted: false };

  constructor(private readonly store: KeyValueStore | null = browserStore()) {
    try {
      const raw = store?.getItem(KEY);
      if (raw) this.data = { ...this.data, ...(JSON.parse(raw) as Partial<SaveData>) };
    } catch {
      // Broken or blocked storage: start fresh.
    }
  }

  get xp(): number {
    return this.data.xp;
  }

  get muted(): boolean {
    return this.data.muted;
  }

  set muted(m: boolean) {
    this.data.muted = m;
    this.save();
  }

  /** Adds KN; returns true when the player reached a new rank. */
  addXp(amount: number): boolean {
    const before = rankIndex(this.data.xp);
    this.data.xp += Math.max(0, amount);
    this.save();
    return rankIndex(this.data.xp) > before;
  }

  clearedUpTo(gameId: string, difficulty: number): number {
    return this.data.cleared[`${gameId}:${difficulty}`] ?? 0;
  }

  markCleared(gameId: string, difficulty: number, level: number): void {
    const key = `${gameId}:${difficulty}`;
    this.data.cleared[key] = Math.max(this.data.cleared[key] ?? 0, level);
    this.save();
  }

  lessonBest(topicId: string): number | null {
    return this.data.lessons[topicId] ?? null;
  }

  saveLesson(topicId: string, correct: number): void {
    this.data.lessons[topicId] = Math.max(this.data.lessons[topicId] ?? 0, correct);
    this.save();
  }

  private save(): void {
    try {
      this.store?.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or blocked: progress just is not kept after reload.
    }
  }
}

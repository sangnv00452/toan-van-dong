import type { Level } from '../config';
import { pick, randInt } from './random';

export interface ClockTime {
  h: number;
  m: number;
}

export interface ClockQuestion {
  lines: string[];
  /** Time drawn on the clock while asking. */
  show: ClockTime;
  /** Hand hidden while asking (that is what the player must find). */
  hide: 'hour' | 'minute' | null;
  /** Number 1..12 the player must touch. */
  answer: number;
  /** Time shown after a correct answer. */
  reveal: ClockTime;
}

/** 13 → 1, 12 → 12, 24 → 12. */
export const to12 = (h: number): number => ((h - 1) % 12) + 1;
/** Minutes → the number the long hand points at (0 → 12). */
export const minuteToNumber = (m: number): number => m / 5 || 12;

function hourHand(): ClockQuestion {
  const h = randInt(1, 12);
  return { lines: [`Lúc ${h} giờ,`, 'kim NGẮN chỉ vào số mấy?'], show: { h, m: 0 }, hide: 'hour', answer: h, reveal: { h, m: 0 } };
}

function minuteHand(): ClockQuestion {
  const h = randInt(1, 12);
  const m = 5 * randInt(1, 11);
  return { lines: [`Lúc ${h} giờ ${m} phút,`, 'kim DÀI chỉ vào số mấy?'], show: { h, m }, hide: 'minute', answer: m / 5, reveal: { h, m } };
}

function afternoon(): ClockQuestion {
  const h = randInt(1, 11);
  return { lines: [`Lúc ${h + 12} giờ,`, 'kim NGẮN chỉ vào số mấy?'], show: { h, m: 0 }, hide: 'hour', answer: h, reveal: { h, m: 0 } };
}

function hoursLater(): ClockQuestion {
  const h = randInt(1, 12);
  const k = randInt(2, 6);
  const answer = to12(h + k);
  return { lines: [`Bây giờ là ${h} giờ.`, `${k} giờ nữa, kim NGẮN`, 'chỉ vào số mấy?'], show: { h, m: 0 }, hide: null, answer, reveal: { h: answer, m: 0 } };
}

function minutesLater(): ClockQuestion {
  const h = randInt(1, 12);
  const m = 5 * randInt(0, 11);
  const d = 5 * randInt(2, 9);
  const total = m + d;
  const now = m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
  return {
    lines: [`Bây giờ là ${now}.`, `${d} phút nữa, kim DÀI`, 'chỉ vào số mấy?'],
    show: { h, m },
    hide: null,
    answer: minuteToNumber(total % 60),
    reveal: { h: to12(h + Math.floor(total / 60)), m: total % 60 },
  };
}

/** Dễ: kim ngắn giờ đúng · Vừa: kim dài, giờ buổi chiều · Khó: thời gian trôi qua. */
export function clockQuestion(level: Level): ClockQuestion {
  if (level === 1) return hourHand();
  if (level === 2) return pick([hourHand, minuteHand, afternoon])();
  return pick([minuteHand, afternoon, hoursLater, minutesLater])();
}

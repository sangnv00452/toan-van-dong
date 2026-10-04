/** Logical canvas size; everything is laid out in these units and scaled to the screen. */
export const W = 1280;
export const H = 720;
/** Height of the top bar (timer, scores, menu button). */
export const HUD_H = 84;

// "MathFrogEmoji" is our bundled emoji font (src/core/emoji-font.ts). In FONT it sits
// after the text fonts, so emoji inside sentences use it too instead of the system font.
export const FONT = '"Segoe UI", "Nunito", "Helvetica Neue", Arial, "MathFrogEmoji", sans-serif';
export const EMOJI_FONT = '"MathFrogEmoji", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

/** 1 = Dễ, 2 = Vừa, 3 = Khó. */
export type Level = 1 | 2 | 3;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const contains = (r: Rect, x: number, y: number): boolean =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export const PALETTE = {
  ink: '#1d2340',
  white: '#ffffff',
  yellow: '#ffd23f',
  green: '#2ec27e',
  red: '#ef476f',
  blue: '#3a86ff',
  purple: '#8338ec',
  orange: '#fb8500',
  teal: '#06b6d4',
  pink: '#ff5d8f',
  brown: '#9c6644',
} as const;

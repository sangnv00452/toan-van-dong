import { H, PALETTE, W } from '../config';
import { emoji, panel, text } from './draw';
import { RANKS, rankIndex, rankProgress } from './progress';

export interface FrogOpts {
  mood?: 'happy' | 'calm' | 'sad' | 'eat';
  /** Shows the frog frozen in ice (wrong apple). */
  frozen?: boolean;
  /** Absolute point the tongue reaches to, if sticking it out. */
  tongue?: { x: number; y: number } | null;
  /** Teacher look: round glasses and a graduation cap. */
  teacher?: boolean;
  blink?: boolean;
  /** -1..1, where the pupils look horizontally. */
  look?: number;
}

const BODY = '#43a047';
const BODY_DARK = '#2e7d32';
const BELLY = '#c5e1a5';
const ICE = '#a8dcf5';
const ICE_DARK = '#6bb8de';

/**
 * Green the frog, drawn with shapes (no image files). `x, y` is the middle of
 * the body; `s` = 1 draws a frog about 130 px wide.
 */
export function drawFrog(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, o: FrogOpts = {}): void {
  const body = o.frozen ? ICE : BODY;
  const dark = o.frozen ? ICE_DARK : BODY_DARK;
  const mouthY = -14;

  if (o.tongue) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#e8577a';
    ctx.lineWidth = 12 * s;
    ctx.beginPath();
    ctx.moveTo(x, y + mouthY * s);
    ctx.lineTo(o.tongue.x, o.tongue.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(o.tongue.x, o.tongue.y, 11 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#e8577a';
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Back legs
  ctx.fillStyle = dark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 50, 30, 30, 20, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Body and head
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 12, 58, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -22, 52, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = o.frozen ? '#e3f4fc' : BELLY;
  ctx.beginPath();
  ctx.ellipse(0, 24, 36, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  // Front feet
  ctx.fillStyle = dark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 26, 52, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes on top of the head
  const look = (o.look ?? 0) * 4;
  for (const side of [-1, 1]) {
    const ex = side * 25;
    const ey = -50;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(ex, ey, 19, 0, Math.PI * 2);
    ctx.fill();
    if (o.blink) {
      ctx.strokeStyle = '#1b3d1f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ex - 10, ey);
      ctx.lineTo(ex + 10, ey);
      ctx.stroke();
      continue;
    }
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath();
    ctx.arc(ex, ey, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    ctx.arc(ex + look, ey + 1, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath();
    ctx.arc(ex + look + 2.5, ey - 2.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (o.teacher) drawTeacherGear(ctx);

  // Cheeks
  ctx.fillStyle = 'rgba(255, 128, 160, 0.55)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 34, -12, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Mouth
  ctx.strokeStyle = '#1b3d1f';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const mood = o.tongue ? 'eat' : (o.mood ?? 'calm');
  if (mood === 'eat') {
    ctx.fillStyle = '#7a1f2b';
    ctx.ellipse(0, mouthY, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === 'sad' || o.frozen) {
    ctx.arc(0, mouthY + 14, 14, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  } else {
    const r = mood === 'happy' ? 22 : 18;
    ctx.arc(0, mouthY - r + 8, r, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
  ctx.restore();

  if (o.frozen) {
    // Ice block around the frog
    ctx.save();
    ctx.globalAlpha = 0.45;
    panel(ctx, x - 82 * s, y - 82 * s, 164 * s, 160 * s, 18 * s, '#d6f1ff', PALETTE.white, 4);
    ctx.restore();
    emoji(ctx, '❄️', x - 62 * s, y - 64 * s, 30 * s);
    emoji(ctx, '❄️', x + 64 * s, y + 40 * s, 24 * s);
  }
}

function drawTeacherGear(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 3.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * 25, -50, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-9, -52);
  ctx.quadraticCurveTo(0, -58, 9, -52);
  ctx.stroke();
  // Graduation cap
  ctx.fillStyle = '#263238';
  ctx.beginPath();
  ctx.moveTo(0, -98);
  ctx.lineTo(46, -84);
  ctx.lineTo(0, -70);
  ctx.lineTo(-46, -84);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-22, -80, 44, 12);
  ctx.strokeStyle = PALETTE.yellow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -84);
  ctx.lineTo(36, -74);
  ctx.lineTo(36, -56);
  ctx.stroke();
}

/** A lily pad seen slightly from above, with its little notch. */
export function drawLilyPad(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color = '#3fa34d'): void {
  const ry = r * 0.62;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 40, 60, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 8, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.ellipse(x, y, r, ry, 0, -Math.PI / 2 + 0.22, -Math.PI / 2 - 0.22 + Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 80, 30, 0.45)';
  ctx.lineWidth = Math.max(1.5, r * 0.03);
  for (let i = 1; i < 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * ry * 0.85);
    ctx.stroke();
  }
  ctx.restore();
}

/** An apple; `ice` turns it into a frozen apple. */
export function drawApple(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, kind: 'red' | 'ice' | 'grey' = 'red'): void {
  const fill = kind === 'red' ? '#e53935' : kind === 'ice' ? '#8fd3f4' : '#9e9e9e';
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y, r * 0.78, 0, Math.PI * 2);
  ctx.arc(x + r * 0.32, y, r * 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.45, y - r * 0.35, r * 0.18, r * 0.3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = Math.max(3, r * 0.08);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.62);
  ctx.quadraticCurveTo(x + r * 0.05, y - r * 0.95, x + r * 0.18, y - r * 1.05);
  ctx.stroke();
  ctx.fillStyle = kind === 'ice' ? '#d6f1ff' : '#66bb6a';
  ctx.beginPath();
  ctx.ellipse(x + r * 0.32, y - r * 0.88, r * 0.26, r * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  if (kind === 'ice') {
    ctx.globalAlpha = 0.5;
    panel(ctx, x - r * 1.15, y - r * 1.1, r * 2.3, r * 2.1, r * 0.25, '#e8f7ff', PALETTE.white, 3);
  }
  ctx.restore();
}

/** Pond water with slow ripples. `alpha` < 1 lets the camera image show through. */
export function drawPond(ctx: CanvasRenderingContext2D, t: number, alpha = 1, shift = 0): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#7fd3d8');
  g.addColorStop(0.45, '#3aa6b9');
  g.addColorStop(1, '#1f6f8b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    const rx = (((i * 263 - shift * 0.6) % (W + 200)) + W + 200) % (W + 200) - 100;
    const ry = 120 + ((i * 151) % (H - 140));
    const k = (t * 0.35 + i * 0.37) % 1;
    ctx.globalAlpha = alpha * (1 - k) * 0.9;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 20 + k * 70, (20 + k * 70) * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** Reeds and lotus flowers along the pond edges (home and learn screens). */
export function drawPondDecor(ctx: CanvasRenderingContext2D, t: number): void {
  const pads: [number, number, number][] = [
    [110, 640, 70],
    [1180, 690, 90],
    [820, 640, 55],
    [690, 250, 45],
    [600, 690, 45],
  ];
  for (const [x, y, r] of pads) drawLilyPad(ctx, x, y + Math.sin(t + x) * 3, r, '#4caf50');
  emoji(ctx, '🪷', 600, 674 + Math.sin(t * 1.3) * 3, 48);
  emoji(ctx, '🪷', 1180, 664 + Math.sin(t * 1.1) * 3, 64);
  emoji(ctx, '🪷', 820, 622, 44);
  ctx.strokeStyle = '#2e7d32';
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const bx = 18 + i * 14;
    const sway = Math.sin(t * 1.2 + i) * 6;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(bx, H);
    ctx.quadraticCurveTo(bx + sway, H - 120, bx + sway * 2, H - 190 - (i % 3) * 30);
    ctx.stroke();
  }
}

/** Speech bubble with a tail pointing down-left to (tailX, tailY). */
export function speechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tailX: number, tailY: number): void {
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.beginPath();
  ctx.moveTo(x + 40, y + h - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(x + 90, y + h - 2);
  ctx.fill();
  panel(ctx, x, y, w, h, 24, 'rgba(255,255,255,0.96)', BODY, 4);
}

/** Rank icon, name and a KN bar towards the next rank. */
export function drawRankCard(ctx: CanvasRenderingContext2D, x: number, y: number, xp: number): void {
  const i = rankIndex(xp);
  const rank = RANKS[i];
  const next = RANKS[i + 1];
  panel(ctx, x, y, 400, 96, 22, 'rgba(29,35,64,0.82)', PALETTE.yellow, 3);
  emoji(ctx, rank.icon, x + 50, y + 48, 50);
  text(ctx, `Green · ${rank.name}`, x + 92, y + 30, { size: 26, align: 'left', maxWidth: 296 });
  panel(ctx, x + 92, y + 54, 290, 22, 11, 'rgba(255,255,255,0.25)');
  panel(ctx, x + 92, y + 54, Math.max(22, 290 * rankProgress(xp)), 22, 11, PALETTE.green);
  const label = next ? `${xp} / ${next.min} KN` : `${xp} KN · Hạng cao nhất!`;
  text(ctx, label, x + 237, y + 66, { size: 15, weight: 700, outline: 'rgba(0,0,0,0.4)' });
}

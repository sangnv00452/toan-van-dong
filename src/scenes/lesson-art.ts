import type { Rect } from '../config';
import { emoji, measure, text } from '../core/draw';
import { drawFrog } from '../core/frog-art';

/**
 * Animated chalkboard pictures for the theory pages of each lesson topic.
 * `ART[topicId][theoryIndex]` draws inside `a` at time `t` (seconds).
 */
type Art = (ctx: CanvasRenderingContext2D, a: Rect, t: number) => void;

const WHITE = '#ffffff';
const YELLOW = '#ffd23f';
const PINK = '#ff9aae';
const BLUE = '#8fd3f4';
const GREEN = '#7CFC9A';
const DIM = 'rgba(255,255,255,0.35)';

/** 0..1 repeating every `period` seconds. */
const phase = (t: number, period: number): number => (t % period) / period;
/** 0..1 that rises over the first `part` of the cycle, then holds at 1. */
const grow = (t: number, period: number, part = 0.6): number => Math.min(1, phase(t, period) / part);

function label(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size = 24, color = WHITE, align: CanvasTextAlign = 'center'): void {
  text(ctx, s, x, y, { size, color, align, weight: 700 });
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = WHITE, width = 3, dash: number[] = []): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][], fill: string | null, stroke = WHITE, width = 3): void {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

/** 10×10 grid with the first `filled` cells coloured (row by row). */
function grid100(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number, filled: number, color = YELLOW): void {
  for (let i = 0; i < 100; i++) {
    const cx = x + (i % 10) * cell;
    const cy = y + Math.floor(i / 10) * cell;
    if (i < filled) {
      ctx.fillStyle = color;
      ctx.fillRect(cx, cy, cell, cell);
    }
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, cell, cell);
  }
}

/** Horizontal bar split into `parts`, with fraction `k` filled. */
function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, k: number, parts: number, color = YELLOW): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, k)), h);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
  for (let i = 1; i < parts; i++) line(ctx, x + (w * i) / parts, y, x + (w * i) / parts, y + h, DIM, 2);
}

/** Digits with a comma that jumps from position `from` to `to` (count of digits before it) as k goes 0→1. */
function commaHop(ctx: CanvasRenderingContext2D, digits: string, from: number, to: number, cx: number, y: number, size: number, k: number): void {
  const step = size * 0.6;
  const gap = size * 0.3;
  const x0 = cx - (digits.length * step + gap) / 2;
  const pos = from + (to - from) * k;
  // Digits right of the comma move over to leave room for it, like a real number.
  [...digits].forEach((d, i) => {
    const shift = gap * Math.max(0, Math.min(1, i + 1 - pos));
    label(ctx, d, x0 + step * (i + 0.5) + shift, y, size);
  });
  const hop = Math.sin(k * Math.PI) * size * 0.7;
  label(ctx, ',', x0 + step * pos + gap / 2, y - size * 0.05 - hop, size, YELLOW);
}

/** Unit cubes of an nx × ny × nz box in isometric view; only the first `layers` layers are drawn. */
function isoBox(ctx: CanvasRenderingContext2D, ox: number, oy: number, nx: number, ny: number, layers: number, u: number, color = '#4caf50'): void {
  const P = (i: number, j: number, k: number): [number, number] => [ox + (i - j) * u * 0.87, oy + (i + j) * u * 0.5 - k * u];
  for (let k = 0; k < layers; k++) {
    for (let s = 0; s <= nx + ny - 2; s++) {
      for (let i = 0; i < nx; i++) {
        const j = s - i;
        if (j < 0 || j >= ny) continue;
        poly(ctx, [P(i + 1, j, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i + 1, j, k + 1)], '#2e7d32', WHITE, 1.5);
        poly(ctx, [P(i, j + 1, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)], '#388e3c', WHITE, 1.5);
        poly(ctx, [P(i, j, k + 1), P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)], color, WHITE, 1.5);
      }
    }
  }
}

function clock(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, minutes: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 4;
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(ctx, cx + Math.sin(a) * r * 0.85, cy - Math.cos(a) * r * 0.85, cx + Math.sin(a) * r, cy - Math.cos(a) * r, WHITE, 3);
  }
  const hand = (turns: number, len: number, color: string, width: number) => {
    const a = turns * Math.PI * 2;
    line(ctx, cx, cy, cx + Math.sin(a) * len, cy - Math.cos(a) * len, color, width);
  };
  hand(minutes / 720, r * 0.5, BLUE, 7);
  hand(minutes / 60, r * 0.8, PINK, 4);
}

/** A road from x0 to x0+w with labelled marks; returns the x of a position 0..1 along it. */
function road(ctx: CanvasRenderingContext2D, x0: number, y: number, w: number, marks: [number, string][]): (k: number) => number {
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x0, y - 12, w, 24);
  line(ctx, x0, y, x0 + w, y, DIM, 2, [12, 10]);
  for (const [k, s] of marks) {
    line(ctx, x0 + w * k, y - 18, x0 + w * k, y + 18, WHITE, 3);
    label(ctx, s, x0 + w * k, y + 38, 20);
  }
  return (k) => x0 + w * k;
}

function triangle(ctx: CanvasRenderingContext2D, x: number, by: number, base: number, h: number, apex: number, fill: string | null): [number, number] {
  const top: [number, number] = [x + apex, by - h];
  poly(ctx, [[x, by], [x + base, by], top], fill);
  return top;
}

function trapezoid(ctx: CanvasRenderingContext2D, x: number, by: number, big: number, small: number, h: number, fill: string | null): void {
  const off = (big - small) / 2;
  poly(ctx, [[x, by], [x + big, by], [x + off + small, by - h], [x + off, by - h]], fill);
}

function pie(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, k: number, color: string): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/** Lines that appear one after another, then all stay for a moment. */
function steps(ctx: CanvasRenderingContext2D, a: Rect, t: number, lines: string[], size = 30): void {
  const shown = Math.min(lines.length, Math.floor(phase(t, lines.length * 1.4 + 2) * (lines.length + 1.4)) + 1);
  const gap = Math.min(size * 1.5, a.h / lines.length);
  lines.slice(0, shown).forEach((s, i) => label(ctx, s, a.x + a.w / 2, a.y + gap * (i + 0.6), size, i === lines.length - 1 ? YELLOW : WHITE));
}

/** Emoji mirrored so it faces right, the direction it moves in. */
function emojiRight(ctx: CanvasRenderingContext2D, e: string, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(-1, 1);
  emoji(ctx, e, 0, 0, size);
  ctx.restore();
}

const mid = (a: Rect) => ({ cx: a.x + a.w / 2, cy: a.y + a.h / 2 });

export const ART: Record<string, Art[]> = {
  'decimals-intro': [
    (ctx, a, t) => {
      const { cx, cy } = mid(a);
      const size = 96;
      const left = phase(t, 3) < 0.5;
      const w3 = measure(ctx, '3', size);
      const wc = measure(ctx, ',', size);
      const w75 = measure(ctx, '75', size);
      const x0 = cx - (w3 + wc + w75) / 2;
      label(ctx, '3', x0 + w3 / 2, cy - 20, left ? size * 1.1 : size, BLUE);
      label(ctx, ',', x0 + w3 + wc / 2, cy - 10, size, YELLOW);
      label(ctx, '75', x0 + w3 + wc + w75 / 2, cy - 20, left ? size : size * 1.1, PINK);
      label(ctx, '⬆ phần nguyên', x0 + w3 / 2 - 60, cy + 70, 24, left ? BLUE : DIM);
      label(ctx, '⬆ phần thập phân', x0 + w3 + wc + w75 / 2 + 80, cy + 70, 24, left ? DIM : PINK);
    },
    (ctx, a, t) => {
      const { cy } = mid(a);
      const cell = Math.min(18, (a.h - 40) / 10);
      const blink = phase(t, 1.2) < 0.7;
      const bx = a.x + 30;
      for (let i = 0; i < 10; i++) {
        if (i === 0 && blink) {
          ctx.fillStyle = YELLOW;
          ctx.fillRect(bx + i * 30, cy - 30, 30, 30);
        }
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + i * 30, cy - 30, 30, 30);
      }
      label(ctx, '1 phần trong 10 phần', bx + 150, cy + 25, 22);
      label(ctx, '1/10 = 0,1', bx + 150, cy + 60, 30, YELLOW);
      const gx = a.x + a.w - 30 - cell * 10;
      grid100(ctx, gx, a.y + 5, cell, blink ? 1 : 0, PINK);
      label(ctx, '1/100 = 0,01', gx - 110, cy + 60, 30, PINK);
      label(ctx, '1 ô trong 100 ô', gx - 110, cy + 25, 22);
    },
    (ctx, a, t) => {
      const { cy } = mid(a);
      const x0 = a.x + 50;
      const w = a.w - 100;
      line(ctx, x0, cy, x0 + w, cy, WHITE, 3);
      for (let i = 0; i <= 10; i++) {
        line(ctx, x0 + (w * i) / 10, cy - 10, x0 + (w * i) / 10, cy + 10, WHITE, 2);
        if (i % 5 === 0) label(ctx, ['3', '3,5', '4'][i / 5], x0 + (w * i) / 10, cy + 34, 22);
      }
      const k = grow(t, 4);
      const xa = x0 + w * 0.45 * k;
      const xb = x0 + w * 0.5 * k;
      ctx.fillStyle = PINK;
      ctx.fillRect(x0, cy - 70, xa - x0, 18);
      ctx.fillStyle = YELLOW;
      ctx.fillRect(x0, cy - 44, xb - x0, 18);
      label(ctx, '3,45', xa + 40, cy - 61, 22, PINK);
      label(ctx, '3,5', xb + 34, cy - 35, 22, YELLOW);
      if (k >= 1) {
        label(ctx, '3,5 > 3,45  (5 phần mười > 4 phần mười)', a.x + a.w / 2, a.y + a.h - 20, 26, GREEN);
        drawFrog(ctx, xb, cy - 90, 0.3, { mood: 'happy' });
      }
    },
  ],
  'decimals-add-sub': [
    (ctx, a, t) => columnSum(ctx, a, t, ['12,50', '3,75'], '+', '16,25', true),
    (ctx, a, t) => columnSum(ctx, a, t, ['8,30', '2,46'], '−', '5,84', false),
    (ctx, a, t) => {
      const { cx, cy } = mid(a);
      const k = phase(t, 2.4);
      label(ctx, '5,4', cx - 160, cy, 80);
      label(ctx, '=', cx - 40, cy, 70, DIM);
      label(ctx, '5,4', cx + 70, cy, 80);
      const zoom = k < 0.5 ? 1 + Math.sin(k * 2 * Math.PI) * 0.4 : 1;
      label(ctx, '0', cx + 170, cy, 80 * zoom, YELLOW);
      label(ctx, 'Thêm chữ số 0 ở bên phải, giá trị không đổi', cx, a.y + a.h - 18, 24, GREEN);
    },
  ],
  'decimals-mul-div': [
    (ctx, a, t) => {
      const { cx, cy } = mid(a);
      label(ctx, '235 × 4 = 940', cx, a.y + 30, 34);
      const k = grow(t, 3.5, 0.5);
      commaHop(ctx, '940', 3, 1, cx, cy + 10, 80, k);
      label(ctx, '2,35 có 2 chữ số sau dấu phẩy → tách 2 chữ số', cx, a.y + a.h - 18, 24, GREEN);
    },
    (ctx, a, t) => {
      const { cx } = mid(a);
      const k = grow(t, 3.5, 0.5);
      label(ctx, '× 10: sang PHẢI', cx - 200, a.y + 28, 26, YELLOW);
      commaHop(ctx, '347', 1, 2, cx - 200, a.y + a.h * 0.6, 72, k);
      label(ctx, ': 10: sang TRÁI', cx + 200, a.y + 28, 26, PINK);
      commaHop(ctx, '564', 2, 1, cx + 200, a.y + a.h * 0.6, 72, k);
    },
    (ctx, a, t) => steps(ctx, a, t, ['12,6 : 3 = ?', '12 : 3 = 4 → viết 4 rồi dấu phẩy', '6 : 3 = 2', '12,6 : 3 = 4,2']),
  ],
  'percent-intro': [
    (ctx, a, t) => {
      const cell = Math.min(20, (a.h - 10) / 10);
      const n = Math.round(25 * grow(t, 4));
      grid100(ctx, a.x + 60, a.y + 5, cell, n);
      const tx = a.x + 60 + cell * 10 + 220;
      label(ctx, `${n} ô / 100 ô`, tx, a.y + a.h * 0.35, 34);
      label(ctx, `= ${n}/100 = ${n}%`, tx, a.y + a.h * 0.65, 40, YELLOW);
    },
    (ctx, a, t) => {
      const k = grow(t, 4);
      const girls = Math.round(18 * k);
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(a.x + 50 + (i % 20) * 37, a.y + 25 + Math.floor(i / 20) * 40, 14, 0, Math.PI * 2);
        ctx.fillStyle = i < girls ? PINK : 'rgba(255,255,255,0.25)';
        ctx.fill();
      }
      label(ctx, `● ${girls} bạn nữ / 40 bạn`, a.x + a.w / 2, a.y + 160, 24, PINK);
      bar(ctx, a.x + 40, a.y + 95, a.w - 80, 34, 0.45 * k, 10, PINK);
      label(ctx, `18 : 40 = 0,45 = 45%`, a.x + a.w / 2, a.y + a.h - 20, 30, YELLOW);
    },
  ],
  'percent-of': [
    (ctx, a, t) => {
      const k = grow(t, 4);
      const x = a.x + 40;
      const w = a.w - 80;
      label(ctx, '150', a.x + a.w / 2, a.y + 22, 30);
      bar(ctx, x, a.y + 45, w, 50, 0.2 * k, 10);
      for (let i = 0; i < 10; i++) label(ctx, '10%', x + (w * (i + 0.5)) / 10, a.y + 115, 18, DIM);
      label(ctx, `20% của 150 = ${Math.round(30 * k)}`, a.x + a.w / 2, a.y + a.h - 25, 36, YELLOW);
    },
    (ctx, a, t) => {
      const k = grow(t, 3.5);
      const r = Math.min(60, a.h / 2 - 35);
      const row: [number, string, string][] = [
        [0.1, '10%', ': 10'],
        [0.5, '50%', 'một nửa'],
        [0.25, '25%', ': 4'],
      ];
      row.forEach(([p, name, how], i) => {
        const x = a.x + a.w * (i * 2 + 1) / 6;
        pie(ctx, x, a.y + r + 10, r, p * k, [YELLOW, PINK, BLUE][i]);
        label(ctx, name, x, a.y + 2 * r + 40, 28);
        label(ctx, how, x, a.y + 2 * r + 72, 24, GREEN);
      });
    },
  ],
  'percent-whole': [
    (ctx, a, t) => {
      const k = phase(t, 4);
      const x = a.x + 40;
      const w = a.w - 80;
      bar(ctx, x, a.y + 50, w, 54, 0.3, 10, PINK);
      label(ctx, '30% = 45', x + w * 0.15, a.y + 77, 24, '#1f4d3a');
      label(ctx, k < 0.5 ? '100% = ?' : '100% = 45 : 30 × 100 = 150', a.x + a.w / 2, a.y + 140, 30, k < 0.5 ? WHITE : YELLOW);
      line(ctx, x, a.y + 30, x + w, a.y + 30, YELLOW, 3);
      label(ctx, 'cả số', a.x + a.w / 2, a.y + 16, 20, YELLOW);
    },
    (ctx, a, t) => {
      const cell = Math.min(20, (a.h - 10) / 10);
      const n = Math.max(1, Math.round(100 * grow(t, 5)));
      grid100(ctx, a.x + 60, a.y + 5, cell, n, BLUE);
      const tx = a.x + 60 + cell * 10 + 230;
      label(ctx, '1% = 16 : 20 = 0,8', tx, a.y + a.h * 0.3, 30);
      label(ctx, `${n}% = ${(n * 0.8).toFixed(1).replace('.', ',').replace(',0', '')}`, tx, a.y + a.h * 0.65, 40, YELLOW);
    },
  ],
  'geometry-triangle': [
    (ctx, a, t) => {
      const base = 300;
      const h = Math.min(170, a.h - 40);
      const x = a.x + 80;
      const by = a.y + a.h - 25;
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5));
      poly(ctx, [[x, by], [x + base, by], [x + base, by - h], [x, by - h]], null, YELLOW, 3);
      ctx.globalAlpha = 1;
      triangle(ctx, x, by, base, h, base * 0.4, 'rgba(255,154,174,0.55)');
      label(ctx, 'a', x + base / 2, by + 16, 22);
      label(ctx, 'h', x + base + 18, by - h / 2, 22, YELLOW);
      label(ctx, 'Tam giác bằng NỬA', a.x + a.w * 0.72, a.y + a.h * 0.35, 30);
      label(ctx, 'hình chữ nhật a × h', a.x + a.w * 0.72, a.y + a.h * 0.6, 30, YELLOW);
    },
    (ctx, a, t) => {
      const by = a.y + a.h - 25;
      const h = Math.min(150, a.h - 50);
      triangle(ctx, a.x + 60, by, 240, h, 90, 'rgba(143,211,244,0.4)');
      label(ctx, '8 cm', a.x + 180, by + 16, 22);
      line(ctx, a.x + 150, by, a.x + 150, by - h, YELLOW, 2, [6, 6]);
      label(ctx, '5 cm', a.x + 186, by - h / 2, 22, YELLOW);
      steps(ctx, { x: a.x + 320, y: a.y, w: a.w - 320, h: a.h }, t, ['S = a × h : 2', '= 8 × 5 : 2', '= 20 cm²'], 32);
    },
    (ctx, a, t) => {
      const by = a.y + a.h - 25;
      const base = 360;
      const h = Math.min(160, a.h - 40);
      const x = a.x + (a.w - base) / 2;
      const apex = base / 2 + Math.sin(t * 1.2) * base * 0.45;
      const [tx, ty] = triangle(ctx, x, by, base, h, apex, 'rgba(124,252,154,0.3)');
      line(ctx, tx, ty, tx, by, YELLOW, 3, [8, 6]);
      poly(ctx, [[tx, by - 14], [tx + 14, by - 14], [tx + 14, by]], null, YELLOW, 2);
      label(ctx, 'h', tx + 24, by - h / 2, 24, YELLOW);
      label(ctx, 'Đỉnh di chuyển, chiều cao vẫn vuông góc với đáy', a.x + a.w / 2, a.y + 14, 22, GREEN);
    },
  ],
  'geometry-trapezoid': [
    (ctx, a, t) => {
      const by = a.y + a.h - 30;
      const h = Math.min(150, a.h - 60);
      const x = a.x + 180;
      trapezoid(ctx, x, by, 420, 220, h, 'rgba(143,211,244,0.35)');
      const slide = phase(t, 2) * 60;
      label(ctx, '➜', x + 100 + slide, by + 18, 22, YELLOW);
      label(ctx, '➜', x + 200 + slide, by - h - 18, 22, YELLOW);
      label(ctx, 'đáy lớn', x + 420 + 70, by, 24, PINK);
      label(ctx, 'đáy bé', x + 320 + 70, by - h, 24, BLUE);
      label(ctx, 'hai đáy song song', a.x, a.y + 20, 22, GREEN, 'left');
    },
    (ctx, a, t) => {
      const by = a.y + a.h - 40;
      const h = Math.min(130, a.h - 70);
      const big = 180;
      const small = 90;
      const x = a.x + 30;
      const off = (big - small) / 2;
      trapezoid(ctx, x, by, big, small, h, 'rgba(255,154,174,0.45)');
      // The second, upside-down copy drops in to make a parallelogram.
      const k = grow(t, 4, 0.5);
      const dy = (1 - k) * -60;
      poly(ctx, [[x + off + small, by - h + dy], [x + off + small + big, by - h + dy], [x + big + small, by + dy], [x + big, by + dy]], 'rgba(143,211,244,0.45)');
      const tx = a.x + a.w * 0.76;
      label(ctx, 'Hai hình thang ghép thành', tx, a.y + a.h * 0.3, 24);
      label(ctx, 'hình bình hành (a + b) × h', tx, a.y + a.h * 0.5, 24, YELLOW);
      label(ctx, '→ một hình thang: chia 2', tx, a.y + a.h * 0.7, 24, GREEN);
    },
    (ctx, a, t) => {
      const by = a.y + a.h - 30;
      const h = Math.min(130, a.h - 60);
      trapezoid(ctx, a.x + 40, by, 260, 170, h, 'rgba(124,252,154,0.3)');
      label(ctx, '12 cm', a.x + 170, by + 18, 22);
      label(ctx, '8 cm', a.x + 170, by - h - 18, 22);
      label(ctx, '5 cm', a.x + 330, by - h / 2, 22, YELLOW);
      steps(ctx, { x: a.x + 340, y: a.y, w: a.w - 340, h: a.h }, t, ['S = (a + b) × h : 2', '= (12 + 8) × 5 : 2', '= 50 cm²'], 30);
    },
  ],
  'geometry-circle': [
    (ctx, a, t) => {
      const { cx, cy } = mid(a);
      const r = Math.min(100, a.h / 2 - 15);
      const x = cx - 150;
      ctx.beginPath();
      ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 3;
      ctx.stroke();
      line(ctx, x - r, cy, x + r, cy, PINK, 3);
      const ang = t * 1.2;
      line(ctx, x, cy, x + Math.cos(ang) * r, cy + Math.sin(ang) * r, YELLOW, 5);
      label(ctx, 'r', x + Math.cos(ang) * r * 0.5 + 14, cy + Math.sin(ang) * r * 0.5 - 14, 24, YELLOW);
      label(ctx, 'bán kính r', cx + 160, cy - 40, 30, YELLOW);
      label(ctx, 'đường kính d = r × 2', cx + 160, cy + 10, 30, PINK);
    },
    (ctx, a, t) => {
      const r = Math.min(45, a.h / 4);
      const C = 2 * Math.PI * r;
      const x0 = a.x + 60;
      const gy = a.y + a.h - 50;
      const k = grow(t, 4, 0.75);
      line(ctx, x0, gy, x0 + C + 40, gy, DIM, 2);
      line(ctx, x0, gy, x0 + C * k, gy, YELLOW, 6);
      const cx = x0 + C * k;
      ctx.beginPath();
      ctx.arc(cx, gy - r, r, 0, Math.PI * 2);
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 3;
      ctx.stroke();
      const ang = Math.PI / 2 + k * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * r, gy - r + Math.sin(ang) * r, 6, 0, Math.PI * 2);
      ctx.fillStyle = PINK;
      ctx.fill();
      label(ctx, 'Lăn 1 vòng = chu vi', a.x + a.w - 190, a.y + a.h * 0.3, 28);
      label(ctx, 'C = d × 3,14', a.x + a.w - 190, a.y + a.h * 0.55, 34, YELLOW);
    },
    (ctx, a, t) => {
      const r = Math.min(80, a.h / 2 - 20);
      const cy = a.y + a.h / 2;
      const x = a.x + 40 + r;
      ctx.beginPath();
      ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(143,211,244,0.35)';
      ctx.fill();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 3;
      ctx.stroke();
      line(ctx, x, cy, x + r, cy, YELLOW, 4);
      label(ctx, 'r', x + r / 2, cy - 14, 22, YELLOW);
      const shown = Math.floor(phase(t, 4) * 4.5);
      for (let i = 0; i < Math.min(3, shown); i++) {
        ctx.fillStyle = 'rgba(255,210,63,0.45)';
        ctx.fillRect(x + r + 40 + i * (r + 12), cy - r / 2, r, r);
        ctx.strokeStyle = YELLOW;
        ctx.strokeRect(x + r + 40 + i * (r + 12), cy - r / 2, r, r);
      }
      if (shown >= 4) label(ctx, '+ 0,14', x + r + 40 + 3 * (r + 12) + 30, cy, 26, YELLOW);
      label(ctx, 'S = r × r × 3,14 (hơn 3 hình vuông r × r một chút)', a.x + a.w / 2, a.y + a.h - 10, 22, GREEN);
    },
  ],
  'geometry-volume': [
    (ctx, a, t) => {
      const u = Math.min(12, (a.h - 20) / 17);
      const layers = 1 + Math.floor(phase(t, 5) * 10);
      isoBox(ctx, a.x + 170, a.y + a.h - 18 - u * 10, 10, 10, Math.min(10, layers), u);
      label(ctx, '1 cm³', a.x + a.w - 250, a.y + a.h * 0.25, 28);
      isoBox(ctx, a.x + a.w - 150, a.y + a.h * 0.2, 1, 1, 1, 24, YELLOW);
      label(ctx, `${layers * 100} khối 1 cm³`, a.x + a.w - 220, a.y + a.h * 0.6, 30, YELLOW);
      label(ctx, '1 dm³ = 1000 cm³', a.x + a.w - 220, a.y + a.h * 0.85, 30, GREEN);
    },
    (ctx, a, t) => {
      const u = Math.min(30, (a.h - 30) / 6);
      const layers = Math.min(3, 1 + Math.floor(phase(t, 4.5) * 3.6));
      isoBox(ctx, a.x + 200, a.y + a.h - 20 - u * 4.5 - u * 3, 5, 4, layers, u);
      label(ctx, `${layers} lớp × 20 khối = ${layers * 20}`, a.x + a.w - 200, a.y + a.h * 0.35, 30, YELLOW);
      label(ctx, 'V = 5 × 4 × 3 = 60 cm³', a.x + a.w - 200, a.y + a.h * 0.65, 30, GREEN);
    },
    (ctx, a, t) => {
      const u = Math.min(34, (a.h - 30) / 5);
      const layers = Math.min(3, 1 + Math.floor(phase(t, 4.5) * 3.6));
      isoBox(ctx, a.x + 220, a.y + a.h - 20 - u * 3 - u * 3, 3, 3, layers, u, '#81c784');
      label(ctx, 'Lập phương cạnh 3', a.x + a.w - 200, a.y + a.h * 0.3, 28);
      label(ctx, `V = 3 × 3 × 3 = 27`, a.x + a.w - 200, a.y + a.h * 0.6, 32, YELLOW);
    },
  ],
  'motion-time': [
    (ctx, a, t) => {
      const r = Math.min(95, a.h / 2 - 10);
      const minutes = (t * 20) % 720;
      clock(ctx, a.x + 60 + r, a.y + a.h / 2, r, minutes);
      label(ctx, 'Kim phút chạy 1 vòng = 60 phút', a.x + a.w * 0.62, a.y + a.h * 0.35, 28, PINK);
      label(ctx, 'thì kim giờ nhích 1 số = 1 giờ', a.x + a.w * 0.62, a.y + a.h * 0.6, 28, BLUE);
    },
    (ctx, a, t) => {
      const k = grow(t, 4);
      const x = a.x + 40;
      const w = a.w - 80;
      bar(ctx, x, a.y + 40, w * (2 / 3), 50, Math.min(1, k * 1.5), 4, BLUE);
      bar(ctx, x + w * (2 / 3), a.y + 40, w / 3, 50, Math.max(0, k * 1.5 - 1) * 2, 2, PINK);
      label(ctx, '1 giờ = 60 phút', x + w / 3, a.y + 115, 26, BLUE);
      label(ctx, '0,5 giờ = 30 phút', x + w * (5 / 6), a.y + 115, 26, PINK);
      label(ctx, `1,5 giờ = ${Math.round(90 * k)} phút`, a.x + a.w / 2, a.y + a.h - 20, 34, YELLOW);
    },
    (ctx, a, t) => steps(ctx, a, t, ['2 giờ 45 phút + 1 giờ 30 phút', '= 3 giờ 75 phút', '75 phút = 1 giờ 15 phút', '= 4 giờ 15 phút'], 28),
  ],
  'motion-speed': [
    (ctx, a, t) => {
      const sec = Math.floor(phase(t, 6) * 6);
      const along = road(ctx, a.x + 40, a.y + a.h - 60, a.w - 80, [0, 1, 2, 3, 4, 5].map((i): [number, string] => [i / 5, `${i * 2} m`]));
      const hop = Math.sin((phase(t, 1)) * Math.PI) * 30;
      drawFrog(ctx, along(Math.min(sec, 5) / 5), a.y + a.h - 95 - hop, 0.35, { mood: 'happy' });
      label(ctx, `Sau ${Math.min(sec, 5)} giây: ${Math.min(sec, 5) * 2} m → mỗi giây 2 m`, a.x + a.w / 2, a.y + 22, 28, YELLOW);
    },
    (ctx, a, t) => {
      const k = grow(t, 5, 0.8);
      const along = road(ctx, a.x + 40, a.y + a.h - 60, a.w - 80, [[0, '0'], [1 / 3, '50 km'], [2 / 3, '100 km'], [1, '150 km']]);
      emojiRight(ctx, '🚗', along(k), a.y + a.h - 85, 44);
      label(ctx, `${(k * 3).toFixed(1).replace('.', ',')} giờ`, along(k), a.y + a.h - 125, 22);
      label(ctx, 'Mỗi giờ đi 50 km → v = 150 : 3 = 50 km/giờ', a.x + a.w / 2, a.y + 22, 28, YELLOW);
    },
    (ctx, a, t) => {
      const rows: [string, string, number][] = [
        ['🚗', 'km/giờ', 0.5],
        ['🚶', 'm/phút', 0.2],
        ['🐸', 'm/giây', 0.35],
      ];
      rows.forEach(([icon, unit, speed], i) => {
        const y = a.y + 35 + i * ((a.h - 40) / 3);
        line(ctx, a.x + 40, y + 18, a.x + a.w - 200, y + 18, DIM, 2, [8, 8]);
        const x = a.x + 60 + phase(t * speed, 1) * (a.w - 300);
        if (icon === '🐸') emoji(ctx, icon, x, y, 36);
        else emojiRight(ctx, icon, x, y, 36);
        label(ctx, unit, a.x + a.w - 110, y, 30, [YELLOW, PINK, GREEN][i]);
      });
    },
  ],
  'motion-distance-time': [
    (ctx, a, t) => {
      const k = grow(t, 5, 0.8);
      const along = road(ctx, a.x + 40, a.y + a.h - 60, a.w - 80, [[0, '0'], [0.4, '12 km'], [0.8, '24 km'], [1, '30 km']]);
      emojiRight(ctx, '🚲', along(k), a.y + a.h - 85, 44);
      label(ctx, `${(k * 2.5).toFixed(1).replace('.', ',')} giờ`, along(k), a.y + a.h - 125, 22);
      label(ctx, 's = v × t = 12 × 2,5 = 30 km', a.x + a.w / 2, a.y + 22, 30, YELLOW);
    },
    (ctx, a, t) => {
      const chunks = Math.min(4, Math.floor(phase(t, 5) * 5));
      const x0 = a.x + 40;
      const w = a.w - 80;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i < chunks ? ['rgba(255,210,63,0.6)', 'rgba(255,154,174,0.6)'][i % 2] : 'rgba(255,255,255,0.08)';
        ctx.fillRect(x0 + (w * i) / 4, a.y + 60, w / 4, 50);
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(x0 + (w * i) / 4, a.y + 60, w / 4, 50);
        if (i < chunks) label(ctx, `45 km · giờ ${i + 1}`, x0 + (w * (i + 0.5)) / 4, a.y + 85, 20, '#1f4d3a');
      }
      label(ctx, '180 km', a.x + a.w / 2, a.y + 35, 26);
      label(ctx, `t = 180 : 45 = ${chunks || '?'} giờ`, a.x + a.w / 2, a.y + a.h - 25, 34, YELLOW);
    },
    (ctx, a, t) => {
      const pairs: [string, string][] = [
        ['km/giờ', 'giờ'],
        ['m/phút', 'phút'],
        ['m/giây', 'giây'],
      ];
      const lit = Math.floor(phase(t, 4.5) * 3);
      pairs.forEach(([v, time], i) => {
        const y = a.y + 30 + i * ((a.h - 30) / 3);
        const c = i === lit ? YELLOW : DIM;
        label(ctx, `vận tốc ${v}`, a.x + a.w * 0.3, y, 28, c);
        label(ctx, '⟷', a.x + a.w / 2, y, 28, c);
        label(ctx, `thời gian tính bằng ${time}`, a.x + a.w * 0.72, y, 28, c);
      });
    },
  ],
};

/** Column addition/subtraction with commas lined up; the result appears digit by digit from the right. */
function columnSum(ctx: CanvasRenderingContext2D, a: Rect, t: number, rows: string[], op: string, result: string, highlightCommas: boolean): void {
  const size = 50;
  const step = size * 0.62;
  const commaX = a.x + a.w * 0.42;
  const top = a.y + 40;
  const put = (s: string, y: number, color: string, upto = s.length) => {
    const ci = s.indexOf(',');
    [...s].forEach((ch, i) => {
      if (i < s.length - upto) return;
      label(ctx, ch, commaX + (i - ci) * step, y, size, ch === ',' ? YELLOW : color);
    });
  };
  rows.forEach((r, i) => put(r, top + i * size * 1.1, WHITE));
  label(ctx, op, commaX - 4 * step, top + size * 1.1, size, WHITE);
  const lineY = top + rows.length * size * 1.1 - size * 0.5;
  line(ctx, commaX - 4.5 * step, lineY, commaX + 3 * step, lineY, WHITE, 3);
  const shown = Math.min(result.length, Math.floor(phase(t, 5) * (result.length + 2)));
  put(result, lineY + size * 0.65, YELLOW, shown);
  if (highlightCommas && phase(t, 1.2) < 0.6) line(ctx, commaX, top - size * 0.6, commaX, lineY + size * 1.1, YELLOW, 2, [6, 6]);
  const hint = highlightCommas ? ['Dấu phẩy thẳng cột', 'với dấu phẩy'] : ['Trừ như số tự nhiên,', 'rồi đặt dấu phẩy thẳng cột'];
  hint.forEach((s, i) => label(ctx, s, a.x + a.w * 0.78, a.y + a.h / 2 + (i - 0.5) * 34, 24, GREEN));
}

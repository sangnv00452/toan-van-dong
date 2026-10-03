import { EMOJI_FONT, FONT } from '../config';

export function panel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke?: string,
  lineWidth = 4,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export interface TextOpts {
  size: number;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  weight?: number;
  /** Dark outline that keeps text readable on top of the camera image. */
  outline?: string | null;
  /** Shrinks the font until the text fits this width. */
  maxWidth?: number;
}

export function text(ctx: CanvasRenderingContext2D, str: string, x: number, y: number, o: TextOpts): void {
  let size = o.size;
  const weight = o.weight ?? 800;
  ctx.font = `${weight} ${size}px ${FONT}`;
  if (o.maxWidth) {
    while (size > 12 && ctx.measureText(str).width > o.maxWidth) {
      size -= 2;
      ctx.font = `${weight} ${size}px ${FONT}`;
    }
  }
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = o.baseline ?? 'middle';
  if (o.outline) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, size * 0.16);
    ctx.strokeStyle = o.outline;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = o.color ?? '#ffffff';
  ctx.fillText(str, x, y);
}

/** Width of `str` at the given size (for laying out mixed text). */
export function measure(ctx: CanvasRenderingContext2D, str: string, size: number, weight = 800): number {
  ctx.font = `${weight} ${size}px ${FONT}`;
  return ctx.measureText(str).width;
}

/** Splits text into lines that fit `maxWidth`. */
export function wrapLines(ctx: CanvasRenderingContext2D, str: string, size: number, maxWidth: number, weight = 700): string[] {
  ctx.font = `${weight} ${size}px ${FONT}`;
  const lines: string[] = [];
  let line = '';
  for (const word of str.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function emoji(ctx: CanvasRenderingContext2D, e: string, x: number, y: number, size: number): void {
  ctx.font = `${size}px ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.fillText(e, x, y);
}

/** Stacked fraction (numerator over a bar over denominator) centred on x,y. Returns its width. */
export function fraction(
  ctx: CanvasRenderingContext2D,
  n: number | string,
  d: number | string,
  x: number,
  y: number,
  size: number,
  color: string,
  outline: string | null = null,
): number {
  const w = Math.max(measure(ctx, String(n), size), measure(ctx, String(d), size)) + size * 0.3;
  text(ctx, String(n), x, y - size * 0.58, { size, color, outline });
  text(ctx, String(d), x, y + size * 0.62, { size, color, outline });
  if (outline) {
    ctx.fillStyle = outline;
    ctx.fillRect(x - w / 2 - 2, y - size * 0.07 - 2, w + 4, size * 0.14 + 4);
  }
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y - size * 0.07, w, size * 0.14);
  return w;
}

const FRACTION_RE = /^(\d+)\/(\d+)$/;

/** Draws a math value; "3/4" becomes a stacked fraction, anything else plain text. */
export function value(
  ctx: CanvasRenderingContext2D,
  v: string,
  x: number,
  y: number,
  size: number,
  color: string,
  outline: string | null = null,
  maxWidth?: number,
): void {
  const m = FRACTION_RE.exec(v);
  if (m) fraction(ctx, m[1], m[2], x, y, size * 0.75, color, outline);
  else text(ctx, v, x, y, { size, color, outline, maxWidth });
}

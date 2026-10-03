import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { panel, text, wrapLines } from '../core/draw';
import { Effects } from '../core/effects';
import { drawGreen, drawGreenChange, drawLilyPad, drawPond, MORPH_TIME, speechBubble } from '../core/frog-art';
import { rankChangeMessage, XP_WRONG_PENALTY, xpFor } from '../core/progress';
import { praise, say } from '../core/voice';
import type { Chapter, Example, Exercise, Topic } from '../data/lessons';
import { isCorrectAnswer } from '../math/answer-check';
import { ChapterScene } from './chapter-scene';
import { ART } from './lesson-art';

type Page =
  | { kind: 'theory'; index: number; body: string }
  | { kind: 'example'; index: number; example: Example }
  | { kind: 'exercise'; index: number; exercise: Exercise }
  | { kind: 'summary' };

interface Answer {
  typed: string;
  checked: boolean;
  correct: boolean;
}

/** Chalkboard area on the right; teacher Green stands on the left. */
const BOARD = { x: 380, y: 100, w: 860, h: 530 };
const KEYS = ['7', '8', '9', '⌫', '4', '5', '6', ',', '1', '2', '3', '0'];
const KEY_W = 92;
const KEY_H = 76;
const KEY_GAP = 8;
const PAD_X = BOARD.x + BOARD.w - 30 - (KEY_W * 4 + KEY_GAP * 3);
const PAD_Y = 290;
const MAX_TYPED = 8;

/**
 * One topic: Green explains the theory, walks through examples, then gives
 * exercises where the answer is typed (on-screen keys, mouse, hand or keyboard).
 */
export class LessonScene implements Scene {
  private t = 0;
  private page = 0;
  private readonly pages: Page[];
  private readonly answers: Answer[];
  private readonly fx = new Effects();
  private readonly back: DwellButton;
  private readonly prev: DwellButton;
  private readonly next: DwellButton;
  private readonly keys: DwellButton[];
  private readonly check: DwellButton;
  private readonly again: DwellButton;
  private earned: number | null = null;
  /** KN taken away for wrong answers in this lesson. */
  private penalty = 0;
  /** Green's transformation after a rank change, and what he says about it. */
  private morph: { from: number; to: number; t: number; message: string } | null = null;

  constructor(
    private readonly app: App,
    private readonly chapter: Chapter,
    private readonly topic: Topic,
  ) {
    this.pages = [
      ...topic.theory.map((body, index): Page => ({ kind: 'theory', index, body })),
      ...topic.examples.map((example, index): Page => ({ kind: 'example', index, example })),
      ...topic.exercises.map((exercise, index): Page => ({ kind: 'exercise', index, exercise })),
      { kind: 'summary' },
    ];
    this.answers = topic.exercises.map(() => ({ typed: '', checked: false, correct: false }));
    this.back = new DwellButton({ x: 20, y: 20, w: 200, h: 64 }, '⟵ Chủ đề', { color: 'rgba(29,35,64,0.85)', size: 24, dwell: 1.0 });
    this.prev = new DwellButton({ x: BOARD.x, y: 645, w: 220, h: 64 }, '◀ Trước', { color: PALETTE.purple, size: 28, dwell: 0.8 });
    // Next sits left of centre so the camera status badge (bottom right) never covers it.
    this.next = new DwellButton({ x: BOARD.x + 240, y: 645, w: 300, h: 64 }, 'Tiếp ▶', { color: PALETTE.green, size: 28, dwell: 0.8 });
    this.keys = KEYS.map(
      (k, i) =>
        new DwellButton(
          { x: PAD_X + (i % 4) * (KEY_W + KEY_GAP), y: PAD_Y + Math.floor(i / 4) * (KEY_H + KEY_GAP), w: KEY_W, h: KEY_H },
          k,
          { color: k === '⌫' ? PALETTE.red : '#2f6b52', size: 36, dwell: 0.7 },
        ),
    );
    this.check = new DwellButton({ x: PAD_X, y: PAD_Y + 3 * (KEY_H + KEY_GAP) + 6, w: KEY_W * 4 + KEY_GAP * 3, h: 68 }, '✓ Kiểm tra', {
      color: PALETTE.orange,
      size: 30,
      dwell: 0.8,
    });
    this.again = new DwellButton({ x: BOARD.x + 60, y: 500, w: 340, h: 90 }, '↻ Học lại', { color: PALETTE.blue, size: 32, dwell: 1.0 });
  }

  private get current(): Page {
    return this.pages[this.page];
  }

  private go(delta: number): void {
    this.page = Math.max(0, Math.min(this.pages.length - 1, this.page + delta));
    this.app.sfx.pop();
    if (this.current.kind === 'summary' && this.earned === null) this.finish();
  }

  /** Awards KN once, when the summary page is first reached. */
  private finish(): void {
    const correct = this.answers.filter((a) => a.correct).length;
    this.earned = xpFor(correct);
    this.changeXp(this.earned);
    this.app.progress.saveLesson(this.topic.id, correct);
    this.app.sfx.cheer();
    this.fx.confetti(BOARD.x + BOARD.w / 2, 700);
  }

  /** Adds or removes KN; if Green's rank changes he transforms and says so. */
  private changeXp(delta: number): void {
    const before = this.app.progress.xp;
    this.app.progress.addXp(delta);
    const after = this.app.progress.xp;
    const message = rankChangeMessage(before, after);
    if (message) {
      this.morph = { from: before, to: after, t: 0, message };
      say(message, () => this.app.sfx.croak(after > before ? 1.35 : 0.7));
    }
  }

  /** Exercise pages block "Tiếp" until the answer is checked. */
  private canGoNext(): boolean {
    const p = this.current;
    if (p.kind === 'summary') return false;
    return p.kind !== 'exercise' || this.answers[p.index].checked;
  }

  private type(key: string): void {
    const p = this.current;
    if (p.kind !== 'exercise') return;
    const a = this.answers[p.index];
    if (a.checked) return;
    if (key === '⌫') a.typed = a.typed.slice(0, -1);
    else if (key === ',' && (a.typed.includes(',') || a.typed === '')) return;
    else if (a.typed.length < MAX_TYPED) a.typed += key;
    this.app.sfx.tick();
  }

  private submit(): void {
    const p = this.current;
    if (p.kind !== 'exercise') return;
    const a = this.answers[p.index];
    if (a.checked || a.typed === '') return;
    a.checked = true;
    a.correct = isCorrectAnswer(a.typed, p.exercise.answer);
    const x = BOARD.x + 220;
    if (a.correct) {
      this.app.sfx.correct();
      praise(() => this.app.sfx.croak(1.35));
      this.fx.burst(x, 340, PALETTE.yellow, 26);
      this.fx.float(x, 300, '⭐ Đúng!', PALETTE.yellow, 40);
    } else {
      // A wrong answer costs KN, and can make Green lose a rank.
      this.app.sfx.wrong();
      const before = this.app.progress.xp;
      this.changeXp(-XP_WRONG_PENALTY);
      const lost = before - this.app.progress.xp;
      this.penalty += lost;
      if (lost > 0) this.fx.float(x, 300, `−${lost} KN`, PALETTE.red, 40);
    }
  }

  update(dt: number): void {
    this.t += dt;
    this.fx.update(dt);
    if (this.morph) this.morph.t += dt;
    const input = this.app.input;
    if (this.back.update(dt, input)) {
      this.app.setScene(new ChapterScene(this.app, this.chapter));
      return;
    }
    const p = this.current;
    if (p.kind === 'summary') {
      if (this.again.update(dt, input)) this.app.setScene(new LessonScene(this.app, this.chapter, this.topic));
      else if (this.next.update(dt, input)) this.app.setScene(new ChapterScene(this.app, this.chapter));
      return;
    }
    if (this.page > 0 && this.prev.update(dt, input)) return this.go(-1);
    if (this.canGoNext() && this.next.update(dt, input)) return this.go(1);

    if (p.kind === 'exercise') {
      this.keys.forEach((b, i) => {
        if (b.update(dt, input)) this.type(KEYS[i]);
      });
      if (this.check.update(dt, input)) this.submit();
    }
    for (const k of input.keys) {
      if (/^[0-9]$/.test(k)) this.type(k);
      else if (k === ',' || k === '.') this.type(',');
      else if (k === 'Backspace') this.type('⌫');
      else if (k === 'Enter') {
        if (p.kind === 'exercise' && !this.answers[p.index].checked) this.submit();
        else if (this.canGoNext()) this.go(1);
      } else if (k === 'ArrowRight' && this.canGoNext()) this.go(1);
      else if (k === 'ArrowLeft' && this.page > 0) this.go(-1);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawPond(ctx, this.t);
    text(ctx, `${this.chapter.icon} ${this.topic.title}`, W / 2 + 100, 54, { size: 40, color: PALETTE.yellow, outline: PALETTE.ink, maxWidth: 760 });
    text(ctx, `Trang ${this.page + 1}/${this.pages.length}`, W - 30, 54, { size: 22, align: 'right', weight: 700, outline: PALETTE.ink });
    this.back.draw(ctx);

    // Chalkboard
    panel(ctx, BOARD.x - 10, BOARD.y - 10, BOARD.w + 20, BOARD.h + 20, 22, '#8d6e63');
    panel(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 16, '#1f4d3a');

    const p = this.current;
    let say: string;
    let mood: 'happy' | 'calm' | 'sad' = 'happy';
    if (p.kind === 'theory') {
      say = 'Em đọc thật kỹ phần lý thuyết nhé!';
      this.heading(ctx, `📘 Lý thuyết ${p.index + 1}/${this.topic.theory.length}`);
      const bottom = this.paragraph(ctx, p.body, 190, 28, PALETTE.white, BOARD.w - 60);
      // Animated picture in the free space under the text.
      const top = bottom - 4;
      ART[this.topic.id]?.[p.index]?.(ctx, { x: BOARD.x + 30, y: top, w: BOARD.w - 60, h: BOARD.y + BOARD.h - 12 - top }, this.t);
    } else if (p.kind === 'example') {
      say = 'Xem mình giải từng bước nè!';
      this.heading(ctx, `✏️ Ví dụ ${p.index + 1}`);
      let y = this.paragraph(ctx, p.example.problem, 196, 30, PALETTE.yellow, BOARD.w - 60) + 24;
      for (const step of p.example.steps) y = this.paragraph(ctx, `→ ${step}`, y, 30, PALETTE.white, BOARD.w - 60) + 10;
    } else if (p.kind === 'exercise') {
      const a = this.answers[p.index];
      say = !a.checked ? 'Em nhập đáp án rồi bấm Kiểm tra nhé.' : a.correct ? 'Đúng rồi! Giỏi lắm!' : 'Chưa đúng rồi. Xem lời giải nhé!';
      mood = !a.checked ? 'calm' : a.correct ? 'happy' : 'sad';
      this.drawExercise(ctx, p.index, p.exercise, a);
    } else {
      say = 'Hoàn thành rồi! Mình rất tự hào về em!';
      this.drawSummary(ctx);
    }

    const m = this.morph;
    // For a while after a rank change Green talks about it instead.
    const changing = m !== null && m.t < MORPH_TIME + 1.5;
    if (changing) say = m.message;
    drawLilyPad(ctx, 190, 600, 150);
    const look = { teacher: true, mood, blink: this.t % 3.3 < 0.12, look: 0.8 } as const;
    const fy = 540 + Math.sin(this.t * 2) * 3;
    if (changing) drawGreenChange(ctx, 190, fy, 1.25, m.from, m.to, m.t, look);
    else drawGreen(ctx, 190, fy, 1.25, this.app.progress.xp, look, this.t);
    speechBubble(ctx, 20, 200, 340, 110, 170, 410);
    wrapLines(ctx, say, 24, 300).forEach((line, i, all) => {
      text(ctx, line, 190, 255 + (i - (all.length - 1) / 2) * 30, { size: 24, color: PALETTE.ink, weight: 700 });
    });

    if (p.kind === 'summary') {
      this.next.label = 'Về chương ▶';
      this.next.draw(ctx);
    } else {
      this.next.label = 'Tiếp ▶';
      if (this.page > 0) this.prev.draw(ctx);
      if (this.canGoNext()) this.next.draw(ctx);
    }
    this.fx.draw(ctx);
  }

  private heading(ctx: CanvasRenderingContext2D, str: string): void {
    text(ctx, str, BOARD.x + 30, BOARD.y + 40, { size: 30, color: PALETTE.yellow, align: 'left' });
  }

  /** Wrapped left-aligned text on the board; returns the y below the last line. */
  private paragraph(ctx: CanvasRenderingContext2D, str: string, y: number, size: number, color: string, maxWidth: number): number {
    const lines = wrapLines(ctx, str, size, maxWidth);
    lines.forEach((line, i) => text(ctx, line, BOARD.x + 30, y + i * size * 1.4, { size, color, align: 'left', weight: 700 }));
    return y + lines.length * size * 1.4;
  }

  private drawExercise(ctx: CanvasRenderingContext2D, index: number, ex: Exercise, a: Answer): void {
    this.heading(ctx, `🎯 Bài tập ${index + 1}/${this.topic.exercises.length}`);
    this.paragraph(ctx, ex.q, 196, 30, PALETTE.yellow, BOARD.w - 60);

    const boxX = BOARD.x + 30;
    const boxW = PAD_X - boxX - 30;
    const boxColor = !a.checked ? PALETTE.white : a.correct ? '#c8f7dc' : '#ffd6de';
    panel(ctx, boxX, 300, boxW, 86, 16, boxColor, a.checked ? (a.correct ? PALETTE.green : PALETTE.red) : PALETTE.yellow, 5);
    const caret = !a.checked && this.t % 1 < 0.5 ? '|' : '';
    text(ctx, (a.typed || (a.checked ? '' : '…')) + caret, boxX + 24, 344, { size: 44, color: PALETTE.ink, align: 'left' });
    if (ex.unit) text(ctx, ex.unit, boxX + boxW - 20, 344, { size: 30, color: '#555', align: 'right', weight: 700 });

    if (a.checked) {
      const head = a.correct ? '✓ Chính xác!' : `✗ Đáp án đúng là ${ex.answer}${ex.unit ? ` ${ex.unit}` : ''}`;
      // The keypad is hidden once checked, so the explanation can use the whole board.
      const wide = BOARD.w - 60;
      text(ctx, head, boxX, 420, { size: 30, color: a.correct ? '#7CFC9A' : '#ff9aae', align: 'left', maxWidth: wide });
      wrapLines(ctx, ex.explain, 26, wide).forEach((line, i) => {
        text(ctx, line, boxX, 470 + i * 36, { size: 26, color: PALETTE.white, align: 'left', weight: 600 });
      });
    } else {
      text(ctx, 'Gõ bằng bàn phím, chuột, hoặc giữ tay trên nút.', boxX, 420, { size: 20, color: 'rgba(255,255,255,0.8)', align: 'left', weight: 600, maxWidth: boxW });
      for (const k of this.keys) k.draw(ctx);
      this.check.draw(ctx);
    }
  }

  private drawSummary(ctx: CanvasRenderingContext2D): void {
    const correct = this.answers.filter((a) => a.correct).length;
    const cx = BOARD.x + BOARD.w / 2;
    text(ctx, '🎉 Hoàn thành chủ đề!', cx, BOARD.y + 70, { size: 46, color: PALETTE.yellow });
    text(ctx, `Đúng ${correct}/${this.answers.length} câu`, cx, BOARD.y + 160, { size: 44 });
    const wrong = this.answers.length - correct;
    const kn = this.penalty > 0 ? `+${this.earned ?? 0} KN   −${this.penalty} KN (${wrong} câu sai)` : `+${this.earned ?? 0} KN`;
    text(ctx, kn, cx, BOARD.y + 240, { size: this.penalty > 0 ? 44 : 60, color: '#7CFC9A', maxWidth: BOARD.w - 60 });
    if (this.morph) text(ctx, this.morph.message, cx, BOARD.y + 320, { size: 30, color: PALETTE.orange, maxWidth: BOARD.w - 60 });
    this.again.draw(ctx);
  }
}

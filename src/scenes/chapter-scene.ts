import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { text, wrapLines } from '../core/draw';
import { drawGreen, drawLilyPad, drawPond, speechBubble } from '../core/frog-art';
import type { Chapter } from '../data/lessons';
import { LearnScene } from './learn-scene';
import { LessonScene } from './lesson-scene';

/** The topics of one chapter, with teacher Green on the left. */
export class ChapterScene implements Scene {
  private t = 0;
  private readonly back: DwellButton;
  private readonly topics: DwellButton[];

  constructor(
    private readonly app: App,
    private readonly chapter: Chapter,
  ) {
    this.back = new DwellButton({ x: 20, y: 20, w: 200, h: 64 }, '⟵ Các chương', { color: 'rgba(29,35,64,0.85)', size: 24, dwell: 1.0 });
    const h = Math.min(110, (560 - (chapter.topics.length - 1) * 16) / chapter.topics.length);
    this.topics = chapter.topics.map((topic, i) => {
      const best = app.progress.lessonBest(topic.id);
      const sub = best === null ? 'Chưa học' : `✓ Đã học · đúng nhiều nhất ${best}/${topic.exercises.length} câu`;
      return new DwellButton({ x: 440, y: 120 + i * (h + 16), w: 790, h }, `${i + 1}. ${topic.title}`, {
        color: chapter.color,
        sub,
        size: 32,
        dwell: 1.0,
      });
    });
  }

  update(dt: number): void {
    this.t += dt;
    const input = this.app.input;
    if (this.back.update(dt, input)) {
      this.app.setScene(new LearnScene(this.app));
      return;
    }
    this.topics.forEach((b, i) => {
      if (b.update(dt, input)) {
        this.app.sfx.correct();
        this.app.setScene(new LessonScene(this.app, this.chapter, this.chapter.topics[i]));
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawPond(ctx, this.t);
    text(ctx, `${this.chapter.icon} ${this.chapter.title}`, W / 2 + 100, 56, { size: 46, color: PALETTE.yellow, outline: PALETTE.ink });
    drawLilyPad(ctx, 220, 590, 150);
    drawGreen(ctx, 220, 530 + Math.sin(this.t * 2) * 4, 1.3, this.app.progress.xp, { teacher: true, mood: 'happy', blink: this.t % 3 < 0.12 }, this.t);
    speechBubble(ctx, 40, 190, 360, 120, 200, 400);
    wrapLines(ctx, 'Chương này có những chủ đề bên phải. Em chọn một chủ đề để học nhé!', 22, 300).forEach((line, i) => {
      text(ctx, line, 220, 222 + i * 28, { size: 22, color: PALETTE.ink, weight: 700 });
    });
    this.back.draw(ctx);
    for (const b of this.topics) b.draw(ctx);
  }
}

import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { text } from '../core/draw';
import { drawPond, drawRankCard } from '../core/frog-art';
import { CHAPTERS } from '../data/lessons';
import { ChapterScene } from './chapter-scene';
import { HomeScene } from './home-scene';

/** Learn: the chapters of grade 5 maths. */
export class LearnScene implements Scene {
  private t = 0;
  private readonly back: DwellButton;
  private readonly cards: DwellButton[];

  constructor(private readonly app: App) {
    this.back = new DwellButton({ x: 20, y: 20, w: 200, h: 64 }, '⟵ Trang chủ', { color: 'rgba(29,35,64,0.85)', size: 24, dwell: 1.0 });
    this.cards = CHAPTERS.map((c, i) => {
      const done = c.topics.filter((t) => app.progress.lessonBest(t.id) !== null).length;
      return new DwellButton(
        { x: 110 + (i % 2) * 540, y: 140 + Math.floor(i / 2) * 210, w: 520, h: 186 },
        `Chương ${i + 1}: ${c.title}`,
        { color: c.color, icon: c.icon, sub: `Đã học ${done}/${c.topics.length} chủ đề`, size: 30, dwell: 1.0 },
      );
    });
  }

  update(dt: number): void {
    this.t += dt;
    const input = this.app.input;
    if (this.back.update(dt, input)) {
      this.app.setScene(new HomeScene(this.app));
      return;
    }
    this.cards.forEach((card, i) => {
      if (card.update(dt, input)) {
        this.app.sfx.correct();
        this.app.setScene(new ChapterScene(this.app, CHAPTERS[i]));
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawPond(ctx, this.t);
    text(ctx, '📖 PHẦN HỌC', W / 2, 56, { size: 52, color: PALETTE.yellow, outline: PALETTE.ink });
    text(ctx, 'Chọn một chương. Ếch Green sẽ giảng bài cho em!', W / 2, 108, { size: 24, weight: 700, outline: PALETTE.ink });
    this.back.draw(ctx);
    for (const c of this.cards) c.draw(ctx);
    drawRankCard(ctx, W / 2 - 200, 600, this.app.progress.xp);
  }
}

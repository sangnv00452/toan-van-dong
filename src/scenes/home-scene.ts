import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { text, wrapLines } from '../core/draw';
import { drawFrog, drawLilyPad, drawPond, drawPondDecor, drawRankCard, speechBubble } from '../core/frog-art';
import { TouchTracker, inCircle } from '../games/round-kit';
import { LearnScene } from './learn-scene';
import { PracticeScene } from './practice-scene';

const TIPS = [
  'Chào bạn! Mình là ếch Green. Cùng học toán lớp 5 nhé!',
  'Chọn HỌC để nghe mình giảng bài và làm bài tập.',
  'Chọn LUYỆN TẬP để vừa giơ tay vận động vừa ôn toán!',
  'Mỗi câu đúng được 10 KN. Gom đủ KN để lên hạng nhé!',
  'Chạm vào mình đi, mình sẽ kêu ộp ộp!',
];

const FROG_X = 430;
const FROG_Y = 455;
/** Touching Green inside this radius makes him croak. */
const FROG_HIT_R = 120;
const CROAK_TIME = 1.2;

/** Home: the pond with Green on a lily pad; Practice and Learn in the right corner. */
export class HomeScene implements Scene {
  private t = 0;
  private readonly practice: DwellButton;
  private readonly learn: DwellButton;
  private readonly sound: DwellButton;
  private readonly frogTouch = new TouchTracker();
  /** Seconds left of the croak animation (mouth open, little jump). */
  private croaking = 0;

  constructor(private readonly app: App) {
    this.practice = new DwellButton({ x: W - 410, y: 170, w: 370, h: 160 }, 'Luyện tập', {
      color: PALETTE.orange,
      icon: '🎮',
      sub: 'Trò chơi dùng camera',
      size: 42,
      dwell: 1.0,
    });
    this.learn = new DwellButton({ x: W - 410, y: 360, w: 370, h: 160 }, 'Học', {
      color: PALETTE.blue,
      icon: '📖',
      sub: 'Lý thuyết, ví dụ, bài tập',
      size: 42,
      dwell: 1.0,
    });
    this.sound = new DwellButton({ x: W - 410, y: 560, w: 370, h: 76 }, '', { color: 'rgba(29,35,64,0.8)', size: 26, dwell: 1.0 });
  }

  update(dt: number): void {
    this.t += dt;
    const input = this.app.input;
    this.croaking = Math.max(0, this.croaking - dt);
    const onFrog = (x: number, y: number) => inCircle(x, y, FROG_X, FROG_Y, FROG_HIT_R);
    const clicked = input.click !== null && onFrog(input.click.x, input.click.y);
    if (clicked || this.frogTouch.check(input.pointers, onFrog)) {
      this.app.sfx.croak();
      this.croaking = CROAK_TIME;
    }
    if (this.practice.update(dt, input)) {
      this.app.sfx.correct();
      this.app.setScene(new PracticeScene(this.app));
    } else if (this.learn.update(dt, input)) {
      this.app.sfx.correct();
      this.app.setScene(new LearnScene(this.app));
    } else if (this.sound.update(dt, input)) {
      const p = this.app.progress;
      p.muted = !p.muted;
      if (p.muted) this.app.music.stop();
      else this.app.music.start();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawPond(ctx, this.t);
    drawPondDecor(ctx, this.t);
    text(ctx, 'MATH FROG', 620, 64, { size: 70, color: PALETTE.yellow, outline: PALETTE.ink });
    drawRankCard(ctx, 24, 120, this.app.progress.xp);

    const bob = Math.sin(this.t * 2) * 4;
    // A croak makes Green hop up a little with his mouth open.
    const hop = this.croaking > 0 ? Math.sin(((CROAK_TIME - this.croaking) / CROAK_TIME) * Math.PI) * 30 : 0;
    drawLilyPad(ctx, FROG_X, FROG_Y + 70, 210);
    drawFrog(ctx, FROG_X, FROG_Y + bob - hop, 1.6, {
      mood: this.croaking > 0 ? 'eat' : 'happy',
      blink: this.croaking === 0 && this.t % 3.2 < 0.13,
      look: Math.sin(this.t * 0.7),
    });

    const tip = this.croaking > 0 ? 'Ộp ộp! Ộp ộp! 🐸' : TIPS[Math.floor(this.t / 5) % TIPS.length];
    speechBubble(ctx, 60, 240, 400, 92, FROG_X - 60, FROG_Y - 90);
    wrapLines(ctx, tip, 22, 360).forEach((line, i, all) => {
      text(ctx, line, 260, 286 + (i - (all.length - 1) / 2) * 28, { size: 22, color: PALETTE.ink, weight: 700 });
    });

    this.sound.label = this.app.progress.muted ? '🔇 Nhạc: đang tắt' : '🔊 Nhạc: đang bật';
    this.practice.draw(ctx);
    this.learn.draw(ctx);
    this.sound.draw(ctx);
  }
}

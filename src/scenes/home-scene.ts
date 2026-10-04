import type { App, Scene } from '../app';
import { PALETTE, W } from '../config';
import { DwellButton } from '../core/dwell-button';
import { panel, text, wrapLines } from '../core/draw';
import { drawGreen, drawGreenChange, drawLilyPad, MORPH_TIME, drawPond, drawPondDecor, drawRankCard, speechBubble } from '../core/frog-art';
import { RANKS, rankIndex } from '../core/progress';
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
  private readonly reset: DwellButton;
  private readonly confirmYes: DwellButton;
  private readonly confirmNo: DwellButton;
  /** The "start over?" question is on screen. */
  private confirming = false;
  /** After starting over, Green shrinks back into a tadpole (KN before the reset, seconds since). */
  private restart: { fromXp: number; t: number } | null = null;
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
    this.sound = new DwellButton({ x: W - 410, y: 560, w: 180, h: 76 }, '', { color: 'rgba(29,35,64,0.8)', size: 22, dwell: 1.0 });
    this.reset = new DwellButton({ x: W - 220, y: 560, w: 180, h: 76 }, '↺ Chơi lại từ đầu', { color: 'rgba(29,35,64,0.8)', size: 20, dwell: 1.0 });
    // Wiping progress by hand needs a longer hold, so it cannot happen by accident.
    this.confirmYes = new DwellButton({ x: W / 2 - 330, y: 430, w: 310, h: 96 }, '✓ Xóa, chơi lại', { color: PALETTE.red, size: 30, dwell: 1.5 });
    this.confirmNo = new DwellButton({ x: W / 2 + 20, y: 430, w: 310, h: 96 }, '✗ Thôi', { color: PALETTE.green, size: 30, dwell: 1.0 });
  }

  update(dt: number): void {
    this.t += dt;
    const input = this.app.input;
    if (this.restart) this.restart.t += dt;
    if (this.confirming) {
      // While asking, only the two answers respond.
      if (this.confirmYes.update(dt, input)) {
        this.restart = { fromXp: this.app.progress.xp, t: 0 };
        this.app.progress.reset();
        this.confirming = false;
        this.app.sfx.croak(0.8);
      } else if (this.confirmNo.update(dt, input)) {
        this.confirming = false;
        this.app.sfx.pop();
      }
      return;
    }
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
    } else if (this.reset.update(dt, input)) {
      this.confirming = true;
      this.app.sfx.pop();
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
    // Green's size and shape follow his rank (a tadpole at Nòng nọc).
    const looks = {
      mood: this.croaking > 0 ? 'eat' : 'happy',
      blink: this.croaking === 0 && this.t % 3.2 < 0.13,
      look: Math.sin(this.t * 0.7),
      // Vua ếch (the top rank) wears a crown on the home screen.
      crown: rankIndex(this.app.progress.xp) === RANKS.length - 1,
    } as const;
    const r = this.restart;
    if (r && r.t < MORPH_TIME) drawGreenChange(ctx, FROG_X, FROG_Y + bob, 1.6, r.fromXp, 0, r.t, looks);
    else drawGreen(ctx, FROG_X, FROG_Y + bob - hop, 1.6, this.app.progress.xp, looks, this.t);

    let tip = this.croaking > 0 ? 'Ộp ộp! Ộp ộp! 🐸' : TIPS[Math.floor(this.t / 5) % TIPS.length];
    // As a tadpole, Green introduces himself differently.
    if (tip === TIPS[0] && rankIndex(this.app.progress.xp) === 0) tip = 'Chào bạn! Mình là nòng nọc Green. Gom 100 KN để mình hóa thành ếch nhé!';
    if (r && r.t < MORPH_TIME + 2.5) tip = 'Mình lại là nòng nọc rồi! Cùng học lại từ đầu nhé!';
    // The bubble stays left of Green's head (so the king's crown is never covered) and grows with the text.
    const lines = wrapLines(ctx, tip, 22, 290);
    const bubbleH = lines.length * 28 + 28;
    speechBubble(ctx, 40, 236, 320, bubbleH, FROG_X - 70, FROG_Y - 80);
    lines.forEach((line, i) => {
      text(ctx, line, 200, 236 + bubbleH / 2 + (i - (lines.length - 1) / 2) * 28, { size: 22, color: PALETTE.ink, weight: 700 });
    });

    this.sound.label = this.app.progress.muted ? '🔇 Nhạc: tắt' : '🔊 Nhạc: bật';
    this.practice.draw(ctx);
    this.learn.draw(ctx);
    this.sound.draw(ctx);
    this.reset.draw(ctx);
    if (this.confirming) this.drawConfirm(ctx);
  }

  /** "Start over?" box drawn on the canvas (browser pop-ups would block the game). */
  private drawConfirm(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(10, 20, 40, 0.6)';
    ctx.fillRect(0, 0, W, 720);
    panel(ctx, W / 2 - 380, 190, 760, 370, 30, 'rgba(255,255,255,0.97)', PALETTE.red, 6);
    text(ctx, '↺ Chơi lại từ đầu?', W / 2, 250, { size: 44, color: PALETTE.red });
    text(ctx, 'Xóa hết KN, các màn đã mở và các bài đã học.', W / 2, 315, { size: 26, color: PALETTE.ink, weight: 700 });
    text(ctx, 'Green sẽ trở lại làm nòng nọc.', W / 2, 360, { size: 26, color: PALETTE.ink, weight: 700 });
    this.confirmYes.draw(ctx);
    this.confirmNo.draw(ctx);
  }
}

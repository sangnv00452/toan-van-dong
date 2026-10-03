import { PALETTE } from '../config';
import { text } from './draw';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
}

const CONFETTI = [PALETTE.yellow, PALETTE.pink, PALETTE.blue, PALETTE.green, PALETTE.orange, PALETTE.purple];

/** Particle bursts, confetti and floating "+1" texts that make actions feel good. */
export class Effects {
  private particles: Particle[] = [];
  private texts: FloatText[] = [];

  burst(x: number, y: number, color: string, count = 18, speed = 320): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.6);
      const max = 0.5 + Math.random() * 0.4;
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: max, max, color, size: 5 + Math.random() * 7 });
    }
  }

  confetti(x: number, y: number, count = 60): void {
    for (let i = 0; i < count; i++) {
      const color = CONFETTI[i % CONFETTI.length];
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const s = 350 + Math.random() * 450;
      const max = 1.2 + Math.random() * 0.8;
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: max, max, color, size: 7 + Math.random() * 7 });
    }
  }

  float(x: number, y: number, str: string, color: string = PALETTE.white, size = 44): void {
    this.texts.push({ x, y, text: str, color, size, life: 1 });
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 700 * dt;
      p.vx *= 0.99;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const t of this.texts) {
      t.life -= dt;
      t.y -= 60 * dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const t of this.texts) {
      ctx.globalAlpha = Math.min(1, t.life * 2);
      text(ctx, t.text, t.x, t.y, { size: t.size, color: t.color, outline: '#1d2340' });
    }
    ctx.globalAlpha = 1;
  }
}

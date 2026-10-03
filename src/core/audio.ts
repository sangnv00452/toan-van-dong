/**
 * Small synthesized sound effects (Web Audio), so the game needs no sound files.
 * Browsers only allow audio after a click/key press, hence `unlock()`.
 */
export class Sfx {
  private ctx: AudioContext | null = null;

  unlock(): void {
    if (!this.ctx) this.ctx = new AudioContext();
    void this.ctx.resume();
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, slideTo?: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  correct(): void {
    this.tone(660, 0, 0.12, 'triangle', 0.25);
    this.tone(990, 0.09, 0.2, 'triangle', 0.25);
  }

  wrong(): void {
    this.tone(240, 0, 0.28, 'sawtooth', 0.12, 120);
  }

  pop(): void {
    this.tone(420, 0, 0.09, 'sine', 0.3, 900);
  }

  whoosh(): void {
    this.tone(260, 0, 0.18, 'sawtooth', 0.06, 1300);
  }

  tick(): void {
    this.tone(880, 0, 0.07, 'square', 0.08);
  }

  go(): void {
    this.tone(1046, 0, 0.35, 'square', 0.1);
  }

  cheer(): void {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * 0.11, 0.28, 'triangle', 0.22));
  }
}

/**
 * Small synthesized sound effects (Web Audio), so the game needs no sound files.
 * Browsers only allow audio after a click/key press, hence `unlock()`.
 */
export class Sfx {
  private ctx: AudioContext | null = null;

  /** Shared with the background music; null until `unlock()`. */
  get context(): AudioContext | null {
    return this.ctx;
  }

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

  /**
   * Frog "ộp ộp": two short raspy bursts. A sawtooth voice is chopped ~40 times
   * a second (that rattle is what makes it sound like a frog) and filtered.
   * `pitch` < 1 gives a lower, sadder croak.
   */
  croak(pitch = 1): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    for (const [start, dur] of [
      [0, 0.16],
      [0.22, 0.22],
    ]) {
      const t0 = ctx.currentTime + start;
      const voice = ctx.createOscillator();
      voice.type = 'sawtooth';
      voice.frequency.setValueAtTime(170 * pitch, t0);
      voice.frequency.linearRampToValueAtTime(240 * pitch, t0 + dur * 0.4);
      voice.frequency.linearRampToValueAtTime(150 * pitch, t0 + dur);
      const rattle = ctx.createOscillator();
      rattle.type = 'square';
      rattle.frequency.value = 38;
      const rattleDepth = ctx.createGain();
      rattleDepth.gain.value = 0.5;
      const chop = ctx.createGain();
      chop.gain.value = 0.5;
      rattle.connect(rattleDepth).connect(chop.gain);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 650 * pitch;
      filter.Q.value = 2.5;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t0);
      amp.gain.exponentialRampToValueAtTime(0.9, t0 + 0.02);
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      voice.connect(chop).connect(filter).connect(amp).connect(ctx.destination);
      for (const osc of [voice, rattle]) {
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      }
    }
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

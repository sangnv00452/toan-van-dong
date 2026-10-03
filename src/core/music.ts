import type { Sfx } from './audio';

/**
 * Gentle background tune, synthesized with Web Audio so it needs no music
 * file and works offline. 8 bars in C major (C – Am – F – G, twice) at a calm
 * tempo: a soft chord pad, a quiet bass and a music-box melody, with a little echo.
 */
const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const VOLUME = 0.55;

/** MIDI notes of the chord for each of the 8 bars. */
const CHORDS = [
  [48, 55, 64],
  [45, 52, 60],
  [41, 48, 57],
  [43, 50, 59],
];

/** Melody per bar as [midi note | null for a rest, length in beats]. */
const MELODY: [number | null, number][][] = [
  [[76, 1], [79, 1], [81, 1], [79, 1]],
  [[76, 2], [74, 1], [72, 1]],
  [[69, 1], [72, 1], [74, 1], [76, 1]],
  [[74, 3], [null, 1]],
  [[76, 1], [79, 1], [84, 1], [81, 1]],
  [[79, 2], [76, 1], [74, 1]],
  [[72, 1], [74, 1], [76, 1], [79, 0.5], [76, 0.5]],
  [[74, 2], [72, 2]],
];

const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

export class Music {
  private master: GainNode | null = null;
  private timer = 0;
  private bar = 0;
  private barTime = 0;
  playing = false;

  constructor(private readonly sfx: Sfx) {}

  start(): void {
    const ctx = this.sfx.context;
    if (!ctx || this.playing) return;
    const master = this.master ?? this.buildGraph(ctx);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6);
    this.bar = 0;
    this.barTime = ctx.currentTime + 0.2;
    this.timer = window.setInterval(() => this.schedule(ctx), 100);
    this.playing = true;
  }

  stop(): void {
    const ctx = this.sfx.context;
    window.clearInterval(this.timer);
    this.playing = false;
    if (ctx && this.master) this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  }

  /** master → soft low-pass → speakers, plus a quiet echo for a dreamy pond feel. */
  private buildGraph(ctx: AudioContext): GainNode {
    const master = ctx.createGain();
    master.gain.value = 0;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2600;
    const delay = ctx.createDelay();
    delay.delayTime.value = BEAT * 0.75;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    master.connect(tone).connect(ctx.destination);
    tone.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(ctx.destination);
    this.master = master;
    return master;
  }

  /** Schedules whole bars a little ahead of time, so timing stays steady. */
  private schedule(ctx: AudioContext): void {
    if (ctx.state !== 'running') return;
    while (this.barTime < ctx.currentTime + 0.6) {
      this.playBar(ctx, this.bar, this.barTime);
      this.bar = (this.bar + 1) % MELODY.length;
      this.barTime += BAR;
    }
  }

  private playBar(ctx: AudioContext, bar: number, t0: number): void {
    const chord = CHORDS[bar % CHORDS.length];
    for (const n of chord) this.note(ctx, hz(n), t0, BAR, 'triangle', 0.035, 0.5);
    this.note(ctx, hz(chord[0] - 12), t0, BEAT * 1.8, 'sine', 0.09, 0.02);
    this.note(ctx, hz(chord[0] - 12), t0 + BEAT * 2, BEAT * 1.8, 'sine', 0.07, 0.02);
    let t = t0;
    for (const [n, beats] of MELODY[bar]) {
      if (n !== null) {
        this.note(ctx, hz(n), t, beats * BEAT + 0.6, 'sine', 0.11, 0.01);
        this.note(ctx, hz(n) * 2, t, beats * BEAT * 0.6, 'sine', 0.025, 0.01);
      }
      t += beats * BEAT;
    }
  }

  private note(ctx: AudioContext, freq: number, t0: number, dur: number, type: OscillatorType, gain: number, attack: number): void {
    if (!this.master) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
}

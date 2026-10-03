import type { Level } from '../config';
import { formatNumber } from './format';
import { pick, randInt } from './random';

export interface ScaleRoundData {
  /** Mass of the mystery box, in grams. */
  target: number;
  /** How the mass is written on the box. */
  label: string;
  /** Weights (grams) the player can put on the right pan. */
  weights: number[];
}

export const weightLabel = (g: number): string => (g >= 1000 ? `${g / 1000} kg` : `${g} g`);

/** 3200 → "3 kg 200 g", 3000 → "3 kg", 450 → "450 g". */
export function formatMass(g: number): string {
  const kg = Math.floor(g / 1000);
  const rest = g % 1000;
  if (kg && rest) return `${kg} kg ${rest} g`;
  return kg ? `${kg} kg` : `${rest} g`;
}

/** 2350 → "2,35 kg", 2500 → "2,5 kg". */
export function formatKgDecimal(g: number): string {
  const kg = Math.floor(g / 1000);
  const frac = String(g % 1000).padStart(3, '0').replace(/0+$/, '');
  return frac ? `${kg},${frac} kg` : `${kg} kg`;
}

/** Dễ: số kg tròn · Vừa: kg và g · Khó: thêm quả 50 g, viết bằng g hoặc số thập phân. */
export function scaleRound(level: Level): ScaleRoundData {
  if (level === 1) {
    const target = randInt(2, 9) * 1000;
    return { target, label: formatMass(target), weights: [1000, 2000, 5000] };
  }
  if (level === 2) {
    const target = randInt(1, 4) * 1000 + randInt(1, 9) * 100;
    return { target, label: formatMass(target), weights: [1000, 500, 200, 100] };
  }
  const target = randInt(1, 4) * 1000 + randInt(1, 19) * 50;
  const label = pick([formatMass(target), `${formatNumber(target)} g`, formatKgDecimal(target)]);
  return { target, label, weights: [1000, 500, 200, 100, 50] };
}

import type { Level } from '../config';
import { pick, randInt } from './random';

export type AngleKind = 'nhọn' | 'vuông' | 'tù';
export type ShapeKind = 'tam giác' | 'tròn' | 'vuông' | 'chữ nhật';

export type BallSpec =
  | { kind: 'angle'; angle: AngleKind; degrees: number; rotation: number }
  | { kind: 'shape'; shape: ShapeKind; rotation: number }
  | { kind: 'rect'; a: number; b: number };

export interface KeeperRule {
  label: string;
  make(correct: boolean): BallSpec;
  matches(spec: BallSpec): boolean;
}

const ANGLES: AngleKind[] = ['nhọn', 'vuông', 'tù'];
const SHAPES: ShapeKind[] = ['tam giác', 'tròn', 'vuông', 'chữ nhật'];

function angleSpec(angle: AngleKind): BallSpec {
  const degrees = angle === 'vuông' ? 90 : angle === 'nhọn' ? randInt(25, 70) : randInt(115, 160);
  return { kind: 'angle', angle, degrees, rotation: Math.random() * Math.PI * 2 };
}

function angleRule(): KeeperRule {
  const target = pick(ANGLES);
  return {
    label: `GÓC ${target.toUpperCase()}`,
    make: (correct) => angleSpec(correct ? target : pick(ANGLES.filter((a) => a !== target))),
    matches: (s) => s.kind === 'angle' && s.angle === target,
  };
}

function shapeRule(): KeeperRule {
  const target = pick(SHAPES);
  // A square is also a rectangle, so never mix those two in one round.
  const conflict: ShapeKind | null = target === 'vuông' ? 'chữ nhật' : target === 'chữ nhật' ? 'vuông' : null;
  const others = SHAPES.filter((s) => s !== target && s !== conflict);
  return {
    label: `HÌNH ${target.toUpperCase()}`,
    make: (correct) => ({ kind: 'shape', shape: correct ? target : pick(others), rotation: (Math.random() - 0.5) * 0.8 }),
    matches: (s) => s.kind === 'shape' && s.shape === target,
  };
}

function perimeterRule(): KeeperRule {
  const half = randInt(5, 12);
  const perimeter = half * 2;
  return {
    label: `HÌNH CÓ CHU VI ${perimeter} cm`,
    make: (correct) => {
      if (correct) {
        const a = randInt(1, half - 1);
        return { kind: 'rect', a, b: half - a };
      }
      for (;;) {
        const a = randInt(1, 9);
        const b = randInt(1, 9);
        if (a + b !== half) return { kind: 'rect', a, b };
      }
    },
    matches: (s) => s.kind === 'rect' && (s.a + s.b) * 2 === perimeter,
  };
}

function areaRule(): KeeperRule {
  const area = pick([12, 16, 18, 20, 24, 36]);
  const pairs: [number, number][] = [];
  for (let a = 1; a <= 12; a++) if (area % a === 0 && area / a <= 12) pairs.push([a, area / a]);
  return {
    label: `HÌNH CÓ DIỆN TÍCH ${area} cm²`,
    make: (correct) => {
      if (correct) {
        const [a, b] = pick(pairs);
        return { kind: 'rect', a, b };
      }
      for (;;) {
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        if (a * b !== area) return { kind: 'rect', a, b };
      }
    },
    matches: (s) => s.kind === 'rect' && s.a * s.b === area,
  };
}

/** Dễ: loại góc · Vừa: nhận dạng hình · Khó: chu vi, diện tích hình chữ nhật. */
export function keeperRule(level: Level): KeeperRule {
  if (level === 1) return angleRule();
  if (level === 2) return shapeRule();
  return pick([perimeterRule, areaRule])();
}

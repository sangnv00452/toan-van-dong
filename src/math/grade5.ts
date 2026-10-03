import { makeOptions } from './arithmetic';
import { formatDecimal, formatNumber } from './format';
import { pick, randInt } from './random';

/** 1 = Dễ, 2 = Vừa, 3 = Khó. */
export type Difficulty = 1 | 2 | 3;

export interface Grade5Question {
  text: string;
  answer: string;
  /** All choices (answer included), shuffled and distinct. */
  options: string[];
}

/** `units` of 1/10^digits as Vietnamese text without trailing zeros: (250, 2) → "2,5". */
export function formatUnits(units: number, digits: number): string {
  if (digits === 0) return formatNumber(units);
  return formatDecimal(units, digits).replace(/0+$/, '').replace(/,$/, '');
}

/** Random whole number in [min, max] that is not a multiple of 10 (so it really has a decimal part). */
const decimalUnits = (min: number, max: number): number => {
  const n = randInt(min, max);
  return n % 10 === 0 ? n + 1 : n;
};

/** Builds a question whose answer and wrong choices are integers counted in 1/10^digits. */
function question(text: string, answer: number, candidates: number[], digits: number, count: number): Grade5Question {
  const options = makeOptions(answer, candidates, count).map((u) => formatUnits(u, digits));
  return { text, answer: formatUnits(answer, digits), options };
}

type Maker = (count: number) => Grade5Question;

interface Kind {
  name: string;
  make: Maker;
}

const f1 = (tenths: number) => formatUnits(tenths, 1);

/** For p%, the number must be a multiple of this so p% of it is whole. */
const PERCENT_STEP: Record<number, number> = { 10: 10, 20: 5, 25: 4, 50: 2, 75: 4 };

const KINDS: Record<Difficulty, Kind[]> = {
  1: [
    {
      name: 'Cộng số thập phân',
      make: (count) => {
        const a = decimalUnits(11, 89);
        const b = decimalUnits(11, 99);
        const s = a + b;
        return question(`${f1(a)} + ${f1(b)} = ?`, s, [s + 1, s - 1, s + 10, s - 10], 1, count);
      },
    },
    {
      name: 'Trừ số thập phân',
      make: (count) => {
        const a = decimalUnits(40, 99);
        const b = decimalUnits(11, a - 15);
        const d = a - b;
        return question(`${f1(a)} − ${f1(b)} = ?`, d, [d + 1, d - 1, d + 10, d - 10], 1, count);
      },
    },
    {
      name: 'Nhân, chia với 10, 100',
      make: (count) => {
        // Work in thousandths so ":10" stays a whole number of units.
        const x = decimalUnits(101, 999) * 10;
        const ops = [
          { sign: '× 10', v: x * 10 },
          { sign: '× 100', v: x * 100 },
          { sign: ': 10', v: x / 10 },
        ];
        const op = pick(ops);
        const others = ops.filter((o) => o !== op).map((o) => o.v);
        return question(`${formatUnits(x, 3)} ${op.sign} = ?`, op.v, [...others, x], 3, count);
      },
    },
    {
      name: 'Phân số thập phân',
      make: (count) => {
        const d = pick([10, 100]);
        const n = d === 10 ? randInt(1, 9) : decimalUnits(11, 99);
        const v = (n * 1000) / d;
        return question(`Viết ${n}/${d} thành số thập phân`, v, [v * 10, v / 10, n * 1000], 3, count);
      },
    },
  ],
  2: [
    {
      name: 'Nhân số thập phân',
      make: (count) => {
        const a = decimalUnits(11, 99);
        const b = randInt(2, 9);
        const p = a * b;
        return question(`${f1(a)} × ${b} = ?`, p, [p * 10, p + b, p - b, p + 10], 1, count);
      },
    },
    {
      name: 'Chia số thập phân',
      make: (count) => {
        const q = decimalUnits(11, 99);
        const b = randInt(2, 9);
        return question(`${f1(q * b)} : ${b} = ?`, q, [q * 10, q + 1, q - 1, q + 10], 1, count);
      },
    },
    {
      name: 'Tỉ số phần trăm',
      make: (count) => {
        const p = pick([10, 20, 25, 50, 75]);
        // n must make n × p : 100 a whole number.
        const n = PERCENT_STEP[p] * randInt(3, 30);
        const v = (n * p) / 100;
        return question(`${p}% của ${n} = ?`, v, [n - v, v * 10, v + 10, v + p], 0, count);
      },
    },
    {
      name: 'Đổi đơn vị đo',
      make: (count) => {
        const [from, to, factor] = pick([
          ['m', 'cm', 100],
          ['km', 'm', 1000],
          ['kg', 'g', 1000],
          ['tấn', 'kg', 1000],
          ['giờ', 'phút', 60],
        ] as const);
        const v = decimalUnits(11, 99);
        const ans = (v * factor) / 10;
        const near = factor === 60 ? [v * 10, ans + 10, ans - 10] : [ans * 10, ans / 10, v * 10];
        return question(`${f1(v)} ${from} = ? ${to}`, ans, near, 0, count);
      },
    },
  ],
  3: [
    {
      name: 'Diện tích tam giác',
      make: (count) => {
        const a = randInt(4, 20);
        const h = randInt(3, 15);
        const s = a * h * 5; // tenths of cm²
        return question(`Tam giác đáy ${a} cm, cao ${h} cm. Diện tích = ? cm²`, s, [a * h * 10, (a + h) * 10, s + 10, s - 10], 1, count);
      },
    },
    {
      name: 'Diện tích hình thang',
      make: (count) => {
        const a = randInt(6, 16);
        const b = randInt(3, a - 2);
        const h = randInt(2, 12);
        const s = (a + b) * h * 5;
        return question(`Hình thang đáy ${a} cm và ${b} cm, cao ${h} cm. Diện tích = ? cm²`, s, [(a + b) * h * 10, a * b * h * 10, s + 10, s - 10], 1, count);
      },
    },
    {
      name: 'Chuyển động đều',
      make: (count) => {
        const v = randInt(4, 12) * 5;
        const t = randInt(2, 5);
        const s = v * t;
        return pick<Maker>([
          (c) => question(`Đi ${s} km trong ${t} giờ. Vận tốc = ? km/giờ`, v, [s - t, v + 5, v - 5, s + t], 0, c),
          (c) => question(`Vận tốc ${v} km/giờ, đi ${t} giờ. Quãng đường = ? km`, s, [v + t, s + v, s - v], 0, c),
          (c) => question(`Đi ${s} km với vận tốc ${v} km/giờ. Thời gian = ? giờ`, t, [t + 1, t - 1, t + 2], 0, c),
        ])(count);
      },
    },
    {
      name: 'Thể tích hình hộp',
      make: (count) => {
        const a = randInt(3, 12);
        const b = randInt(2, 10);
        const c = randInt(2, 9);
        const v = a * b * c;
        return question(`Hộp chữ nhật dài ${a} cm, rộng ${b} cm, cao ${c} cm. Thể tích = ? cm³`, v, [a * b, (a + b) * c, v + a, v - b], 0, count);
      },
    },
  ],
};

export const LEVELS_PER_DIFFICULTY = 5;

/** Math topic practised at a level: levels 1–4 each train one kind, level 5 mixes all four. */
export function levelTopic(d: Difficulty, level: number): string {
  return level <= KINDS[d].length ? KINDS[d][level - 1].name : 'Trộn cả 4 dạng';
}

export function grade5Question(d: Difficulty, level: number, count = 3): Grade5Question {
  const kinds = KINDS[d];
  const kind = level <= kinds.length ? kinds[level - 1] : pick(kinds);
  return kind.make(count);
}

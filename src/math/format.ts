/** 12500 → "12 500" (space as thousands separator, like Vietnamese textbooks). */
export const formatNumber = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const formatMoney = (dong: number): string => `${formatNumber(dong)} đ`;

/** Integer `units` of 1/10^digits → Vietnamese decimal text, e.g. (345, 2) → "3,45". */
export function formatDecimal(units: number, digits: number): string {
  const s = String(units).padStart(digits + 1, '0');
  const whole = s.slice(0, s.length - digits);
  const frac = s.slice(s.length - digits);
  return `${formatNumber(Number(whole))},${frac}`;
}

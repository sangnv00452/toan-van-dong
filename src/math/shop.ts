import type { Level } from '../config';
import { SHOP_ITEMS, type ShopCatalogItem } from '../data/shop-items';
import { randInt, shuffle } from './random';

export interface ShopItem {
  icon: string;
  name: string;
  price: number;
}

export interface ShopRoundData {
  items: ShopItem[];
  /** Always the exact total of some items on the shelf, so a solution exists. */
  target: number;
}

/** Prices are rounded to this step: Dễ 1 000 đ, Vừa 500 đ, Khó 100 đ. */
export const priceStep = (level: Level): number => [1000, 500, 100][level - 1];

export function shopRound(level: Level, catalog: ShopCatalogItem[] = SHOP_ITEMS): ShopRoundData {
  const step = priceStep(level);
  const items = shuffle(catalog)
    .slice(0, 6)
    .map((it) => ({ icon: it.icon, name: it.name, price: Math.max(step, Math.round(randInt(it.min, it.max) / step) * step) }));
  const count = level === 1 ? 2 : level === 2 ? randInt(2, 3) : 3;
  const target = shuffle(items)
    .slice(0, count)
    .reduce((sum, it) => sum + it.price, 0);
  return { items, target };
}

import { contains, PALETTE, type Rect } from '../config';
import { emoji, panel, text } from '../core/draw';
import type { Pointer } from '../core/input';
import { formatMoney } from '../math/format';
import { shopRound, type ShopItem, type ShopRoundData } from '../math/shop';
import { BaseRound, TouchTracker } from './round-kit';
import type { GameDef, RoundContext } from './types';

interface Card {
  item: ShopItem;
  rect: Rect;
  touch: TouchTracker;
  bought: boolean;
}

/** Buy items whose prices add up to EXACTLY the target amount. */
class ShopRound extends BaseRound {
  private data!: ShopRoundData;
  private cards: Card[] = [];
  private total = 0;
  private readonly resetRect: Rect;
  private readonly resetTouch = new TouchTracker();
  /** After a win or an overspend, wait a moment before continuing. */
  private pending: { t: number; win: boolean } | null = null;

  constructor(rc: RoundContext) {
    super(rc);
    const r = rc.region;
    this.resetRect = { x: r.x + r.w - 270, y: 600, w: 240, h: 92 };
    this.next();
  }

  private next(): void {
    this.data = shopRound(this.rc.level);
    const r = this.region;
    const gap = 22;
    const w = (r.w - 40 * 2 - gap * 2) / 3;
    const h = 170;
    this.cards = this.data.items.map((item, i) => ({
      item,
      rect: { x: r.x + 40 + (i % 3) * (w + gap), y: this.top + 18 + Math.floor(i / 3) * (h + gap), w, h },
      touch: new TouchTracker(),
      bought: false,
    }));
    this.total = 0;
  }

  private emptyBasket(): void {
    for (const c of this.cards) c.bought = false;
    this.total = 0;
  }

  protected tick(dt: number, pointers: Pointer[]): void {
    const resetHit = this.resetTouch.check(pointers, (x, y) => contains(this.resetRect, x, y));
    const touched = this.cards.filter((c) => c.touch.check(pointers, (x, y) => contains(c.rect, x, y)));

    if (this.pending) {
      this.pending.t -= dt;
      if (this.pending.t <= 0) {
        if (this.pending.win) this.next();
        else this.emptyBasket();
        this.pending = null;
      }
      return;
    }
    if (resetHit) {
      this.emptyBasket();
      this.rc.sfx.whoosh();
      return;
    }
    const card = touched.find((c) => !c.bought);
    if (!card || this.lock > 0) return;

    card.bought = true;
    this.total += card.item.price;
    this.lock = 0.25;
    this.rc.sfx.pop();
    const cx = card.rect.x + card.rect.w / 2;
    const cy = card.rect.y + card.rect.h / 2;
    this.rc.fx.float(cx, cy, `+${formatMoney(card.item.price)}`, PALETTE.white, 34);
    if (this.total === this.data.target) {
      this.good(this.cx, 560);
      this.rc.sfx.cheer();
      this.rc.fx.confetti(this.cx, 640);
      this.pending = { t: 1.1, win: true };
    } else if (this.total > this.data.target) {
      this.bad(this.cx, 560);
      this.rc.fx.float(this.cx, 520, 'Quá số tiền rồi! Mua lại nhé', PALETTE.red, 40);
      this.pending = { t: 1.4, win: false };
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.banner(ctx, `Mua hàng hết ĐÚNG ${formatMoney(this.data.target)}`);
    for (const c of this.cards) {
      const { x, y, w, h } = c.rect;
      ctx.globalAlpha = c.bought ? 0.45 : 1;
      panel(ctx, x, y, w, h, 22, 'rgba(255,255,255,0.93)', PALETTE.orange, 5);
      emoji(ctx, c.item.icon, x + 70, y + h / 2, 72);
      text(ctx, c.item.name, x + 130, y + h * 0.36, { size: 30, color: PALETTE.ink, align: 'left', maxWidth: w - 145 });
      text(ctx, formatMoney(c.item.price), x + 130, y + h * 0.68, { size: 36, color: PALETTE.orange, align: 'left', maxWidth: w - 145 });
      ctx.globalAlpha = 1;
      if (c.bought) text(ctx, '✓', x + w - 34, y + 34, { size: 44, color: PALETTE.green, outline: PALETTE.white });
    }
    // Basket bar
    const r = this.region;
    panel(ctx, r.x + 30, 600, r.w - 330, 92, 24, 'rgba(29,35,64,0.85)', PALETTE.yellow, 4);
    emoji(ctx, '🧺', r.x + 80, 646, 52);
    const icons = this.cards.filter((c) => c.bought).map((c) => c.item.icon).join(' ');
    text(ctx, `Giỏ hàng: ${formatMoney(this.total)}`, r.x + 125, 646, { size: 38, align: 'left', color: PALETTE.yellow });
    if (icons) text(ctx, icons, r.x + r.w - 320, 646, { size: 36, align: 'right', weight: 400 });
    const rr = this.resetRect;
    panel(ctx, rr.x, rr.y, rr.w, rr.h, 24, PALETTE.purple, PALETTE.white, 4);
    text(ctx, '↺ Mua lại', rr.x + rr.w / 2, rr.y + rr.h / 2, { size: 34 });
  }
}

export const shopGame: GameDef = {
  id: 'shop',
  title: 'Ếch Đi Chợ',
  icon: '🧺',
  topic: 'Tiền Việt Nam, cộng nhẩm',
  grades: 'Lớp 2–5',
  howTo: 'Ếch Green đi chợ! Chạm vào món hàng để bỏ vào giỏ. Mua sao cho hết ĐÚNG số tiền đề bài. Quá tiền thì phải mua lại!',
  levels: ['Giá tròn nghìn, 2 món', 'Giá lẻ 500 đ, 2–3 món', 'Giá lẻ 100 đ, 3 món'],
  duration: 90,
  versus: false,
  stars: [3, 6, 9],
  color: PALETTE.orange,
  create: (rc) => new ShopRound(rc),
};

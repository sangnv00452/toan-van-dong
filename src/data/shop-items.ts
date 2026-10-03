/**
 * Hàng trong "Siêu Thị Tí Hon". Có thể thêm/sửa món: giá thật sẽ được chọn
 * ngẫu nhiên trong khoảng [min, max] đồng rồi làm tròn theo mức chơi.
 */
export interface ShopCatalogItem {
  icon: string;
  name: string;
  min: number;
  max: number;
}

export const SHOP_ITEMS: ShopCatalogItem[] = [
  { icon: '✏️', name: 'Bút chì', min: 2000, max: 5000 },
  { icon: '🖊️', name: 'Bút bi', min: 3000, max: 7000 },
  { icon: '📒', name: 'Quyển vở', min: 6000, max: 12000 },
  { icon: '📏', name: 'Thước kẻ', min: 3000, max: 8000 },
  { icon: '🖍️', name: 'Bút sáp', min: 8000, max: 15000 },
  { icon: '📚', name: 'Truyện tranh', min: 12000, max: 25000 },
  { icon: '🧃', name: 'Hộp sữa', min: 5000, max: 9000 },
  { icon: '🍞', name: 'Bánh mì', min: 10000, max: 20000 },
  { icon: '🍎', name: 'Quả táo', min: 5000, max: 12000 },
  { icon: '🍌', name: 'Quả chuối', min: 2000, max: 5000 },
  { icon: '🍪', name: 'Bánh quy', min: 4000, max: 10000 },
  { icon: '🎈', name: 'Bóng bay', min: 3000, max: 8000 },
  { icon: '🧸', name: 'Gấu bông', min: 20000, max: 30000 },
  { icon: '⚽', name: 'Quả bóng', min: 15000, max: 30000 },
];

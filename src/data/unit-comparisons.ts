/**
 * Câu so sánh đổi đơn vị cho trò "Trái Hay Phải?" (mức Khó).
 * Có thể thêm câu mới: `a`, `b` là chữ hiện trên màn hình; `va`, `vb` là giá trị
 * đã đổi về CÙNG một đơn vị (ghi ở chú thích) để máy biết bên nào lớn hơn.
 * Hai giá trị không được bằng nhau.
 */
export interface UnitComparison {
  a: string;
  b: string;
  va: number;
  vb: number;
}

export const UNIT_COMPARISONS: UnitComparison[] = [
  { a: '1 km', b: '900 m', va: 1000, vb: 900 }, // m
  { a: '1 km 50 m', b: '1 500 m', va: 1050, vb: 1500 }, // m
  { a: '2 m 5 cm', b: '250 cm', va: 205, vb: 250 }, // cm
  { a: '3 m', b: '29 dm', va: 300, vb: 290 }, // cm
  { a: '5 dm', b: '45 cm', va: 50, vb: 45 }, // cm
  { a: '1 m', b: '999 mm', va: 1000, vb: 999 }, // mm
  { a: '0,5 m', b: '45 cm', va: 50, vb: 45 }, // cm
  { a: '3/4 m', b: '80 cm', va: 75, vb: 80 }, // cm
  { a: '1 kg', b: '999 g', va: 1000, vb: 999 }, // g
  { a: '2 kg 50 g', b: '2 500 g', va: 2050, vb: 2500 }, // g
  { a: '1/4 kg', b: '300 g', va: 250, vb: 300 }, // g
  { a: '1,2 kg', b: '1 020 g', va: 1200, vb: 1020 }, // g
  { a: '3 yến', b: '25 kg', va: 30, vb: 25 }, // kg
  { a: '1 tạ', b: '90 kg', va: 100, vb: 90 }, // kg
  { a: '1 tấn', b: '1 200 kg', va: 1000, vb: 1200 }, // kg
  { a: '2 giờ', b: '130 phút', va: 120, vb: 130 }, // phút
  { a: '1 giờ 15 phút', b: '70 phút', va: 75, vb: 70 }, // phút
  { a: '1/2 giờ', b: '25 phút', va: 30, vb: 25 }, // phút
  { a: '3 phút', b: '200 giây', va: 180, vb: 200 }, // giây
  { a: '1 ngày', b: '25 giờ', va: 24, vb: 25 }, // giờ
  { a: '1 tuần', b: '8 ngày', va: 7, vb: 8 }, // ngày
  { a: '1 thế kỉ', b: '99 năm', va: 100, vb: 99 }, // năm
  { a: '1 m²', b: '90 dm²', va: 100, vb: 90 }, // dm²
  { a: '5 dm²', b: '480 cm²', va: 500, vb: 480 }, // cm²
  { a: '1 l', b: '900 ml', va: 1000, vb: 900 }, // ml
  { a: '2 l 300 ml', b: '2 030 ml', va: 2300, vb: 2030 }, // ml
];

# Danh sách trò chơi – Toán Vận Động

Có 9 trò, mỗi trò một **dạng toán** và một **kiểu vận động** khác nhau. Trò nào cũng có 3 mức. Mã nguồn của từng trò nằm trong `src/games/`, phần sinh câu hỏi nằm trong `src/math/`.

| # | Trò chơi | Dạng toán (Dễ · Vừa · Khó) | Lớp | Kiểu vận động | Thời gian | 2 người |
|---|---|---|---|---|---|---|
| 1 | 🎈 **Bắt Bong Bóng** | Cộng trừ trong 100 · Bảng nhân 2–9 · Nhân, chia, số có 2 chữ số | 2–5 | Chạm vào bóng đang bay lên | 60 s | ✓ |
| 2 | 🆚 **Trái Hay Phải?** | Số có 4 chữ số · Số thập phân, phân số · Đổi đơn vị đo | 3–5 | Giơ tay sang bên lớn hơn | 60 s | ✓ |
| 3 | 🔨 **Đập Chuột Chia Hết** | Chẵn/lẻ · Chia hết cho 2, 5, 10 · Chia hết cho 3, 9 | 1–4 | Phản xạ nhanh, đập nhầm bị trừ điểm; 20 giây đổi luật một lần | 60 s | ✓ |
| 4 | 🛒 **Siêu Thị Tí Hon** | Giá tròn nghìn · Giá lẻ 500 đ · Giá lẻ 100 đ | 2–5 | Chọn nhiều món cho đủ **đúng** một số tiền | 90 s | – |
| 5 | 🥷 **Ninja Chém Phân Số** | Bằng 1/2 · Bằng 1/3, 2/3, 1/4, 3/4 · Phân số khó hơn | 4–5 | **Vung tay thật nhanh** để chém quả bay theo đường cong | 60 s | ✓ |
| 6 | 🧤 **Thủ Môn Hình Học** | Góc nhọn/vuông/tù · Nhận dạng hình · Chu vi, diện tích | 3–5 | Chặn bóng đúng, để lọt bóng sai | 60 s | ✓ |
| 7 | ⏰ **Đồng Hồ Khổng Lồ** | Kim ngắn giờ đúng · Kim dài, giờ buổi chiều · Thời gian trôi qua | 2–3 | Chạm số quanh mặt đồng hồ | 90 s | – |
| 8 | 🪜 **Bậc Thang Quy Luật** | Đếm thêm · Cộng/trừ đều, gấp đôi · Khoảng cách tăng dần, gấp ba | 1–4 | Chạm 3 số tiếp theo **đúng thứ tự** | 90 s | – |
| 9 | ⚖️ **Cân Thăng Bằng** | Số kg tròn · kg và g · Viết bằng g hoặc số thập phân | 3–5 | Thêm hoặc bớt quả cân đến khi cân thẳng | 90 s | – |

## Điểm và sao
- Mỗi câu đúng được **+1**. Ở trò 3, 5, 6, làm nhầm bị **−1**, nhưng điểm không xuống dưới 0.
- Hết giờ thì hiện điểm và **1–3 ngôi sao**. Mốc điểm để được sao khai báo trong `stars` của từng trò.
- Chế độ 2 người: chia đôi màn hình, NGƯỜI 1 đứng bên trái, NGƯỜI 2 đứng bên phải. Mỗi bạn có đề riêng và điểm riêng.

## Những "bẫy" cố ý để học sinh phải nghĩ
- Bong bóng: các đáp án sai là lỗi hay gặp, ví dụ nhầm sang hàng khác trong bảng nhân (7 × 8 với 7 × 9).
- Trái Hay Phải: 3,5 so với 3,45 (số nhiều chữ số hơn chưa chắc đã lớn hơn); 1 km 50 m so với 1 500 m.
- Ninja: 3/6 (bằng 1/2) và 3/7 (không bằng) trông rất giống nhau.
- Thủ Môn mức Vừa: không bao giờ trộn hình vuông với hình chữ nhật trong cùng một lượt, vì hình vuông cũng là một hình chữ nhật đặc biệt.
- Siêu Thị: số tiền đề bài luôn là tổng giá của một vài món có trên kệ, nên lúc nào cũng có lời giải.

## Thêm nội dung (không cần biết lập trình)
- Câu đổi đơn vị: `src/data/unit-comparisons.ts`. Mỗi dòng gồm chữ hai bên và giá trị đã đổi về cùng một đơn vị.
- Món hàng siêu thị: `src/data/shop-items.ts`. Mỗi dòng gồm biểu tượng, tên món, giá thấp nhất và giá cao nhất.
- Sửa xong thì chạy `npm test` để máy tự kiểm tra (ví dụ hai bên không được bằng nhau), rồi chạy `npm run build`.

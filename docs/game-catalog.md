# Math Frog – các phần và trò chơi

Ý tưởng do hai bạn trong đội mô tả: [game-ideas/01-math-frog.md](./game-ideas/01-math-frog.md).

## Trang chủ
Một cái hồ, ếch Green ngồi trên lá sen, có nhạc nền nhẹ (nút bật/tắt). Góc trên bên trái hiện **hạng** và **điểm kinh nghiệm (KN)**. Góc bên phải có hai phần **Luyện tập** và **Học**. Chạm vào ếch Green (bằng chuột hoặc bằng tay) thì ếch kêu **ộp ộp**.

## Phần Học (không cần camera)
Ếch thầy giáo giảng lý thuyết (mỗi trang lý thuyết có **hình minh họa chuyển động**, ví dụ dấu phẩy nhảy khi nhân với 10, bánh xe lăn ra chu vi, khối lập phương xếp từng lớp) → ví dụ giải từng bước → bài tập **nhập đáp án** (gõ bằng bàn phím, bấm chuột, hoặc giữ tay trên bàn phím số trên màn hình). Làm xong chủ đề thì được KN.

| Chương | Chủ đề |
|---|---|
| 1. 🔢 Số thập phân | Số thập phân là gì? · Cộng, trừ · Nhân, chia |
| 2. 💯 Tỉ số phần trăm | Tỉ số phần trăm là gì? · Tìm phần trăm của một số · Tìm một số khi biết phần trăm |
| 3. 📐 Hình học | Diện tích tam giác · Diện tích hình thang · Hình tròn · Thể tích hình hộp |
| 4. 🚲 Thời gian và chuyển động | Số đo thời gian · Vận tốc · Quãng đường và thời gian |

Nội dung nằm trong `src/data/lessons.ts`. Hai bạn sửa hoặc thêm câu ở đó rồi chạy `npm test`, máy sẽ kiểm tra đáp án có viết đúng kiểu số hay không.

## Phần Luyện tập (dùng camera)
### 3 trò Math Frog
Mỗi trò có 3 mức **Dễ, Vừa, Khó**, mỗi mức có **5 màn**. Chọn đúng thì ếch khen ("Ngon quá!", "Giỏi lắm!"…), chọn sai thì ếch nói **"Đói quá!"**. Máy không có giọng đọc tiếng Việt thì ếch kêu "ộp" vui hoặc buồn thay cho lời nói. Qua màn này mới mở màn sau. Màn 1–4 luyện mỗi màn một dạng toán, màn 5 trộn cả 4 dạng.

| Trò | Cách chơi | Thử thách mỗi màn |
|---|---|---|
| 🍎 **Ếch Ăn Táo** | Táo ghi số rơi xuống; di chuyển tay vào quả ghi đáp án đúng để ếch ăn | Ăn đủ số táo đúng trước khi hết giờ (60/75/90 giây) |
| 🪷 **Nhảy Lá Sen** | Mặt hồ trôi sang trái; chạm lá sen ghi đáp án đúng để ếch nhảy sang. Sai hoặc chậm quá là ếch rơi xuống nước, phải chơi lại | Nhảy đúng đủ số lá liên tiếp; màn sau hồ trôi nhanh hơn |
| 🧊 **Táo Băng** | Các quả táo trông giống nhau; chạm quả đúng thì ếch ăn táo đỏ, chạm sai thì ếch ăn nhầm táo đóng băng và bị đông cứng một lúc | Ăn đủ số táo đỏ, không bị đóng băng 3 lần |

| Mức | Màn 1 | Màn 2 | Màn 3 | Màn 4 |
|---|---|---|---|---|
| Dễ | Cộng số thập phân | Trừ số thập phân | Nhân, chia với 10, 100 | Phân số thập phân |
| Vừa | Nhân số thập phân | Chia số thập phân | Tỉ số phần trăm | Đổi đơn vị đo |
| Khó | Diện tích tam giác | Diện tích hình thang | Chuyển động đều | Thể tích hình hộp |

Đề do máy tạo ngẫu nhiên (`src/math/grade5.ts`). Đáp án sai là những lỗi hay gặp, ví dụ đặt sai dấu phẩy, quên chia 2 khi tính diện tích tam giác.

### 9 trò chơi khác của Green
Đây là 9 trò cũ, đã đổi sang chủ đề ếch. Trò nào cũng có ếch Green: nhảy lên khi đúng, buồn khi sai, khen bằng giọng nói. Ếch thổi bong bóng, thè lưỡi bắt bọ rùa, đeo băng đô ninja, làm thủ môn nhảy ra chặn bóng, đội mũ thầy giáo hỏi giờ, xách giỏ đi chợ, leo bậc thang, đứng xem cân. Mỗi trò có 3 mức. Trò 1, 2, 3, 5, 6 chơi được **2 người đấu** (chia đôi màn hình).

| # | Trò | Dạng toán (Dễ · Vừa · Khó) |
|---|---|---|
| 1 | 🫧 Ếch Thổi Bong Bóng | Cộng trừ trong 100 · Bảng nhân · Nhân, chia |
| 2 | 🪷 Lá Sen Nào Lớn Hơn? | Số có 4 chữ số · Số thập phân, phân số · Đổi đơn vị |
| 3 | 🐞 Ếch Bắt Bọ Chia Hết | Chẵn/lẻ · Chia hết cho 2, 5, 10 · Chia hết cho 3, 9 |
| 4 | 🧺 Ếch Đi Chợ | Tiền Việt Nam, cộng nhẩm |
| 5 | 🥷 Ếch Ninja Phân Số | Phân số bằng nhau (vung tay thật nhanh để chém) |
| 6 | 🧤 Ếch Thủ Môn Hình Học | Góc · Nhận dạng hình · Chu vi, diện tích |
| 7 | ⏰ Đồng Hồ Lá Sen | Xem giờ, thời gian trôi qua |
| 8 | 🪜 Ếch Leo Bậc Quy Luật | Dãy số có quy luật |
| 9 | ⚖️ Ếch Cân Hàng | Khối lượng, đổi kg và g |

## Điểm kinh nghiệm (KN) và hạng
- Mỗi câu đúng được **10 KN**, ở cả phần Học lẫn phần Luyện tập. Qua một màn Math Frog được thêm **20 KN**.
- Ở phần Học, mỗi câu bài tập **sai bị trừ 5 KN** (KN không xuống dưới 0).
- Green **lớn lên theo hạng**: hạng càng cao ếch càng to, tụt hạng thì ếch bé lại. Ở hạng Nòng nọc, Green là **con nòng nọc**; đủ 100 KN thì hóa thành ếch. Mỗi lần đổi hạng có hiệu ứng biến hình và Green nói ra điều đó. (Trong 3 trò camera, Green vẫn giữ hình ếch để còn nhảy và thè lưỡi.)
- Hạng: 💧 Nòng nọc (0) → 🌱 Ếch con (100) → 🍀 Ếch xanh (300) → 🥈 Ếch bạc (600) → 🥇 Ếch vàng (1000) → 👑 Vua ếch (1600 KN). Muốn đổi tên hạng thì sửa trong `src/core/progress.ts`.
- KN, các màn đã qua và các chủ đề đã học chỉ được lưu **trên máy tính đang dùng**, không gửi đi đâu.
- Muốn chơi lại từ đầu (ví dụ giữa các lượt giám khảo chơi thử): bấm **↺ Chơi lại từ đầu** ở trang chủ rồi chọn **Xóa, chơi lại**. Cài đặt nhạc được giữ nguyên.

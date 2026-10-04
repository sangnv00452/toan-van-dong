# Math Frog – Học toán lớp 5 cùng ếch Green

Sản phẩm dự thi **Cuộc thi Sản phẩm STEM 2026 – Trường Tiểu học Đô thị Sài Đồng**, bảng khối 3–5 *"Lập trình kiến tạo – Trường học thông minh"*. Đội gồm 2 học sinh lớp 5.

Hai bạn trong đội nghĩ ra Math Frog ([bản mô tả](docs/game-ideas/01-math-frog.md)). Trang chủ là hồ sen có ếch Green và nhạc nhẹ, với hai phần: **Học** (4 chương Toán lớp 5: lý thuyết, ví dụ, bài tập nhập đáp án) và **Luyện tập** (3 trò Math Frog, mỗi trò 3 mức × 5 màn, cùng 9 trò chơi khác của Green). Mỗi câu đúng được điểm kinh nghiệm để leo hạng. Phần Luyện tập điều khiển bằng bàn tay qua webcam. Trí tuệ nhân tạo MediaPipe tìm đầu ngón tay trỏ của người chơi, và người chơi giơ tay chạm vào đáp án. Website có chế độ 2 người đấu, chạy được khi không có mạng, và chơi được bằng chuột khi không có camera.

Lịch thi: vòng 1 ngày **05/10/2026**, chung kết ngày **09/10/2026**.

**Chơi online:** https://sangnv00452.github.io/toan-van-dong/ · **Trang giải thích bằng hình động:** https://sangnv00452.github.io/toan-van-dong/presentation/giai-thich-he-thong.html

## Chạy nhanh
```bash
npm install          # lần đầu, cần Internet
npm run build        # chép thư viện và tải mô hình nhận diện tay
start-offline.bat    # hoặc: npm run offline  →  http://localhost:4173
```
**Bản đóng gói cho máy thi** (không cần Node, không cần mạng): `npm run package:local` tạo ra `release/MathFrog-local.zip`. Giải nén rồi nhấp đúp `CHAY-MATH-FROG.bat`.
Chi tiết, kể cả cách đưa lên mạng và xử lý sự cố: [docs/run-guide.md](docs/run-guide.md).

## Tài liệu
| File | Nội dung |
|---|---|
| [docs/contest-brief.md](docs/contest-brief.md) | Tóm tắt cuộc thi, các câu cần hỏi giáo viên |
| [docs/product-idea.md](docs/product-idea.md) | Vấn đề, giải pháp, phân vai, rủi ro |
| [docs/game-idea-guide.md](docs/game-idea-guide.md) | Hướng dẫn hai bạn tự nghĩ trò chơi; phiếu mô tả ở [docs/game-ideas/template.md](docs/game-ideas/template.md) |
| [docs/game-catalog.md](docs/game-catalog.md) | Các chương, 3 trò Math Frog, 9 trò khác, KN và hạng |
| [docs/how-it-works.md](docs/how-it-works.md) | Cách hoạt động, giải thích cho học sinh và cho giám khảo |
| [docs/pitch-and-qa.md](docs/pitch-and-qa.md) | Kịch bản thuyết trình 2 phút, câu hỏi giám khảo |
| [presentation/giai-thich-he-thong.html](presentation/giai-thich-he-thong.html) | Trang hình động giải thích 13 khái niệm cho học sinh (mở bằng trình duyệt, không cần mạng) |
| [plans/261003-1924-math-frog/plan.md](plans/261003-1924-math-frog/plan.md) | Kế hoạch làm Math Frog |

## Cấu trúc mã nguồn
| Thư mục | Nội dung |
|---|---|
| `src/core/` | Camera, nhận diện tay, đầu vào (tay, chuột, bàn phím), âm thanh, nhạc nền, hình vẽ ếch Green, KN và hạng, nút bấm bằng cách giữ tay |
| `src/games/frog/` | 3 trò Math Frog (`registry.ts` là danh sách trò) |
| `src/games/` | 9 trò chơi khác của Green (`registry.ts`) và bộ công cụ chung `round-kit.ts` |
| `src/math/` | Sinh đề toán (hàm thuần, có kiểm thử) |
| `src/data/` | Nội dung dễ sửa: bài học 4 chương (`lessons.ts`), câu đổi đơn vị, món hàng siêu thị |
| `src/scenes/` | Các màn hình: mở đầu, trang chủ hồ sen, Học (chương, chủ đề, bài học), Luyện tập (chọn màn, chơi, kết quả), 9 trò khác |
| `tests/` | Kiểm thử Vitest (`npm test`) |
| `scripts/vendor-mediapipe.mjs` | Chép thư viện và tải mô hình vào `public/mediapipe/` (bị git bỏ qua) |

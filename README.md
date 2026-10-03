# Toán Vận Động – Học toán bằng cả cơ thể

Sản phẩm dự thi **Cuộc thi Sản phẩm STEM 2026 – Trường Tiểu học Đô thị Sài Đồng**, bảng khối 3–5 *"Lập trình kiến tạo – Trường học thông minh"*. Đội gồm 2 học sinh lớp 5.

Đây là website gồm **9 trò chơi học toán điều khiển bằng bàn tay qua webcam**. Trí tuệ nhân tạo MediaPipe tìm đầu ngón tay trỏ của người chơi, và người chơi giơ tay chạm vào đáp án. Website có chế độ 2 người đấu, chạy được khi không có mạng, và chơi được bằng chuột khi không có camera.

Lịch thi: vòng 1 ngày **05/10/2026**, chung kết ngày **09/10/2026**.

**Chơi online:** https://sangnv00452.github.io/toan-van-dong/ · **Trang giải thích bằng hình động:** https://sangnv00452.github.io/toan-van-dong/presentation/giai-thich-he-thong.html

## Chạy nhanh
```bash
npm install          # lần đầu, cần Internet
npm run build        # chép thư viện và tải mô hình nhận diện tay
start-offline.bat    # hoặc: npm run offline  →  http://localhost:4173
```
Chi tiết, kể cả cách đưa lên mạng và xử lý sự cố: [docs/run-guide.md](docs/run-guide.md).

## Tài liệu
| File | Nội dung |
|---|---|
| [docs/contest-brief.md](docs/contest-brief.md) | Tóm tắt cuộc thi, các câu cần hỏi giáo viên |
| [docs/product-idea.md](docs/product-idea.md) | Vấn đề, giải pháp, phân vai, rủi ro |
| [docs/game-catalog.md](docs/game-catalog.md) | 9 trò chơi, các mức, cách thêm nội dung |
| [docs/how-it-works.md](docs/how-it-works.md) | Cách hoạt động, giải thích cho học sinh và cho giám khảo |
| [docs/pitch-and-qa.md](docs/pitch-and-qa.md) | Kịch bản thuyết trình 2 phút, câu hỏi giám khảo |
| [presentation/giai-thich-he-thong.html](presentation/giai-thich-he-thong.html) | Trang hình động giải thích 13 khái niệm cho học sinh (mở bằng trình duyệt, không cần mạng) |
| [plans/261003-0034-toan-van-dong-camera/plan.md](plans/261003-0034-toan-van-dong-camera/plan.md) | Kế hoạch theo ngày |

## Cấu trúc mã nguồn
| Thư mục | Nội dung |
|---|---|
| `src/core/` | Camera, nhận diện tay, đầu vào (tay và chuột), âm thanh, vẽ, hiệu ứng, nút bấm bằng cách giữ tay |
| `src/games/` | 9 trò chơi (`registry.ts` là danh sách trò) và bộ công cụ chung `round-kit.ts` |
| `src/math/` | Sinh đề toán (hàm thuần, có kiểm thử) |
| `src/data/` | Nội dung dễ sửa: câu đổi đơn vị, món hàng siêu thị |
| `src/scenes/` | Các màn hình: mở đầu, menu, chọn mức, chơi, kết quả |
| `tests/` | Kiểm thử Vitest (`npm test`) |
| `scripts/vendor-mediapipe.mjs` | Chép thư viện và tải mô hình vào `public/mediapipe/` (bị git bỏ qua) |

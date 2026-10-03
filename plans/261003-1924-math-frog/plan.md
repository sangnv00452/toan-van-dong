# Kế hoạch: Math Frog

**Trạng thái:** đã làm xong 7 phần (03/10); kiểm thử, typecheck, build đạt; đã chạy thử trên Chrome với camera giả. Chờ thử với webcam thật · **Nguồn ý tưởng:** [phiếu mô tả của hai bạn](../../docs/game-ideas/01-math-frog.md) · Thay cho [kế hoạch cũ](../261003-0034-toan-van-dong-camera/plan.md)

## Mục tiêu
Website học toán lớp 5 với ếch Green. Trang chủ là hồ sen có nhạc nhẹ. Góc phải có hai phần:
- **Học:** 4 chương, mỗi chủ đề gồm ếch giảng lý thuyết → ví dụ → bài tập nhập đáp án.
- **Luyện tập:** dùng camera, gồm 3 trò Math Frog (3 mức × 5 màn, mở khóa dần) và 9 trò cũ đã đổi sang chủ đề ếch.

Làm bài nào cũng được điểm kinh nghiệm (KN) theo số câu đúng để leo hạng.

## Giữ nguyên
Camera, nhận diện tay, nút giữ tay, chạy khi mất mạng, khung 1280×720, cách chơi của 9 trò cũ.

## Các phần
| # | Phần | File chính |
|---|---|---|
| 1 | Nền: nhạc, lưu KN/hạng/màn đã qua, hình vẽ ếch, nhập phím | `src/core/music.ts`, `progress.ts`, `frog-art.ts`, `input.ts` |
| 2 | Đề toán lớp 5 theo mức và màn; kiểm tra đáp án nhập | `src/math/grade5.ts`, `src/math/answer-check.ts` |
| 3 | Trang chủ hồ sen, phần Luyện tập, chọn màn, chơi thử thách, kết quả | `src/scenes/` |
| 4 | 3 trò: Ếch Ăn Táo, Nhảy Lá Sen, Táo Băng | `src/games/frog/` |
| 5 | Phần Học: nội dung 4 chương, màn hình bài học, bàn phím số | `src/data/lessons.ts`, `src/scenes/lesson-scene.ts` |
| 6 | Đổi 9 trò cũ sang chủ đề ếch; tính KN cho 9 trò cũ | `src/games/*.ts`, `result-scene.ts` |
| 7 | Kiểm thử, typecheck, build, chạy thử trên trình duyệt; cập nhật tài liệu | `tests/`, `docs/`, `README.md`, `CLAUDE.md` |

## Xong khi
- `npm test`, `npm run typecheck`, `npm run build` đều đạt
- Chạy thử trên trình duyệt: trang chủ, phần Học (một chủ đề từ đầu đến cuối), 3 trò Math Frog, 1 trò cũ; KN tăng và vẫn còn sau khi tải lại trang
- Tài liệu nói đúng về Math Frog

## Việc còn mở
- Hai bạn chơi thử, góp ý vào phiếu mô tả
- Tên các hạng và nội dung bài học: hai bạn đọc lại, sửa trong `src/data/lessons.ts`

# CLAUDE.md

Dự án STEM cho đội 2 học sinh lớp 5 (Cuộc thi STEM 2026, TH Đô thị Sài Đồng, bảng khối 3–5). Sản phẩm: **Math Frog** (hai bạn tự mô tả ý tưởng trong `docs/game-ideas/01-math-frog.md`): học toán lớp 5 cùng ếch Green. Trang chủ hồ sen có nhạc; phần **Học** (bài học trong `src/data/lessons.ts`) và phần **Luyện tập** điều khiển bằng bàn tay qua webcam (MediaPipe Hand Landmarker): 3 trò Math Frog (`src/games/frog/`, 3 mức × 5 màn) và 9 trò cũ đổi sang chủ đề ếch (`src/games/`). KN và hạng lưu trong `src/core/progress.ts`. Vòng 1 ngày 05/10/2026, chung kết ngày 09/10/2026.

- Stack: Vite + TypeScript (strict) + Canvas 2D, không dùng framework. Lệnh: `npm run dev`, `npm test`, `npm run typecheck`, `npm run build`, `npm run offline`.
- **Phải chạy được khi không có mạng**: không dùng CDN hay font tải từ mạng. Tài nguyên MediaPipe được `scripts/vendor-mediapipe.mjs` chép vào `public/mediapipe/`.
- Bố cục theo khung logic 1280×720 (`src/config.ts`). Trò Math Frog mới implement `FrogGameDef` (`src/games/frog/types.ts`) và đăng ký trong `src/games/frog/registry.ts`; trò kiểu cũ implement `GameDef` (`src/games/types.ts`).
- Ý tưởng trò mới đến từ phiếu mô tả của hai bạn (`docs/game-ideas/`, mẫu ở `template.md`); giữ nguyên lời gốc của các em trong phiếu.
- Emoji được vẽ bằng font emoji mang theo (`public/fonts/math-frog-emoji.woff`, cắt từ Noto Color Emoji) để Windows cũ không hiện ô vuông. Thêm emoji mới thì chạy `npm run emoji-font`; `tests/emoji-font.test.ts` sẽ báo nếu quên.
- Đề toán viết thành hàm thuần trong `src/math/`, và phải có test trong `tests/` (`math.test.ts`, `math-frog.test.ts`).
- Chữ trên giao diện và tài liệu viết bằng tiếng Việt, ngắn gọn, học sinh lớp 5 đọc hiểu được. Chi tiết xem `README.md` và `docs/`.

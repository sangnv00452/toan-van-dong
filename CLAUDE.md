# CLAUDE.md

Dự án STEM cho đội 2 học sinh lớp 5 (Cuộc thi STEM 2026, TH Đô thị Sài Đồng, bảng khối 3–5). Sản phẩm: **Toán Vận Động**, website gồm 9 trò chơi học toán điều khiển bằng bàn tay qua webcam (MediaPipe Hand Landmarker). Vòng 1 ngày 05/10/2026, chung kết ngày 09/10/2026.

- Stack: Vite + TypeScript (strict) + Canvas 2D, không dùng framework. Lệnh: `npm run dev`, `npm test`, `npm run typecheck`, `npm run build`, `npm run offline`.
- **Phải chạy được khi không có mạng**: không dùng CDN hay font tải từ mạng. Tài nguyên MediaPipe được `scripts/vendor-mediapipe.mjs` chép vào `public/mediapipe/`.
- Bố cục theo khung logic 1280×720 (`src/config.ts`). Trò chơi mới implement `GameDef` (`src/games/types.ts`), vẽ trong `region` được cấp (để có chế độ 2 người), rồi đăng ký trong `src/games/registry.ts`.
- Đề toán viết thành hàm thuần trong `src/math/`, và phải có test trong `tests/math.test.ts`.
- Chữ trên giao diện và tài liệu viết bằng tiếng Việt, ngắn gọn, học sinh lớp 5 đọc hiểu được. Chi tiết xem `README.md` và `docs/`.

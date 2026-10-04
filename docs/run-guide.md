# Hướng dẫn cài đặt và chạy

## Cài lần đầu (cần Internet)
Cần cài sẵn **Node.js** từ phiên bản 20 trở lên (máy hiện tại đang có Node 24).

```bash
npm install
npm run build      # tự chép thư viện và tải mô hình nhận diện tay vào public/mediapipe
```

## Bản đóng gói cho máy thi (không cần Node, không cần mạng)
Dùng khi máy thi **không cài Node.js** hoặc không có mạng.

1. Trên máy phát triển, chạy `npm run package:local`. Lệnh này build rồi tạo file **`release/MathFrog-local.zip`** (khoảng 12 MB).
2. Chép file zip sang máy thi (USB hoặc Zalo), **giải nén** ra một thư mục.
3. Nhấp đúp **`CHAY-MATH-FROG.bat`**. Một máy chủ web nhỏ bằng PowerShell (có sẵn trong Windows 10/11) sẽ chạy trên `http://localhost:4173`, rồi Chrome hoặc Edge tự mở trang.
4. Giữ cửa sổ đen mở trong lúc chơi; chơi xong thì đóng cửa sổ đó. Trong zip có file `HUONG-DAN.txt` hướng dẫn và cách xử lý sự cố.

Mã nguồn của bộ đóng gói: `scripts/package-local.mjs` và `scripts/local-package/` (máy chủ `serve-local.ps1`, file hướng dẫn). Thư mục `release/` không được đưa lên git.

## Chạy khi KHÔNG có mạng trên máy đã cài Node (máy phát triển)
- Nhấp đúp file **`start-offline.bat`**. Hoặc chạy lệnh `npm run offline`.
- Trình duyệt tự mở địa chỉ `http://localhost:4173`.
- Lần đầu trình duyệt hỏi quyền camera thì bấm **Cho phép (Allow)**.
- Để cửa sổ đen (máy chủ chạy trên máy) mở trong lúc chơi. Chơi xong thì đóng cửa sổ đó.

> Không mở trực tiếp file `dist/index.html` bằng cách nhấp đúp, vì bộ nhận diện tay không chạy được khi mở theo kiểu đó. Luôn chạy bằng `start-offline.bat`.

## Chơi online (khi CÓ mạng)
- Trò chơi: **https://sangnv00452.github.io/toan-van-dong/**
- Trang hình động giải thích: **https://sangnv00452.github.io/toan-van-dong/presentation/giai-thich-he-thong.html**
- Mỗi lần đẩy code lên nhánh `main` của repo [sangnv00452/toan-van-dong](https://github.com/sangnv00452/toan-van-dong), GitHub Actions tự kiểm thử, build và cập nhật website sau vài phút (`.github/workflows/deploy-pages.yml`).
- Camera chỉ hoạt động trên địa chỉ **https://** hoặc **localhost**.
- Thư mục `dist/` là website tĩnh với đường dẫn tương đối, nên cũng có thể tải lên Netlify, Vercel hoặc Cloudflare Pages.

## Dành cho người phát triển
```bash
npm run dev        # chạy thử, tự tải lại khi sửa code (http://localhost:5173)
npm test           # kiểm thử tự động: đề toán, nội dung bài học, KN và hạng
npm run typecheck
```

## Mẹo khi trình diễn
- Dùng **Chrome** hoặc **Edge**. Nhấn **F11** nếu màn hình chưa toàn màn hình.
- Người chơi đứng cách màn hình 1,5–2 m, phòng đủ sáng, phía sau càng trơn càng tốt.
- Góc dưới bên phải màn hình có dòng trạng thái:
  - "✋ Đang thấy 2 bàn tay" nghĩa là nhận diện đang chạy tốt.
  - Chữ đỏ nghĩa là đang chơi bằng chuột.
- Muốn quay về menu: giữ tay khoảng 1,5 giây trên nút **⟵ Menu** ở góc trên bên trái, hoặc bấm chuột vào nút đó.

## Xử lý sự cố
| Hiện tượng | Cách xử lý |
|---|---|
| "Không mở được camera" | Kiểm tra camera không bị ứng dụng khác (Zoom, Meet) dùng; cho phép quyền camera trong trình duyệt và trong Windows (Cài đặt → Quyền riêng tư → Camera) |
| "Không tải được nhận diện tay" | Chạy lại `npm run build` khi có mạng để tải mô hình, rồi chạy lại `start-offline.bat` |
| Báo cổng 4173 đang bận | Đóng cửa sổ `start-offline` cũ đang chạy rồi mở lại |
| Chấm vàng giật hoặc mất | Thêm đèn, bớt người đứng phía sau, đưa tay rõ vào khung hình |

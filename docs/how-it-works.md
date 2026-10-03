# Toán Vận Động hoạt động thế nào?

## Giải thích cho học sinh (để các em tự kể với giám khảo)

1. **Camera nhìn thấy em.** Website lấy hình từ webcam và hiện lên màn hình **như một tấm gương**: em giơ tay phải thì hình cũng giơ tay bên phải.
2. **Máy tìm ngón tay trỏ.** Website có một "bộ não nhỏ" là trí tuệ nhân tạo (AI) tên là **MediaPipe** của Google. Bộ não này đã được dạy bằng rất nhiều ảnh bàn tay, nên nó tìm ra **21 điểm** trên mỗi bàn tay: các đốt ngón, cổ tay… Trò chơi chỉ dùng **đầu ngón tay trỏ**, là chấm tròn vàng trên màn hình.
3. **Chạm là gì?** Chấm vàng vừa **đi vào** bên trong quả bóng hay cái nút là máy tính coi như em đã chạm. Để tay đứng yên trong đó thì vẫn chỉ tính một lần.
4. **Chém là gì?** Ở trò Ninja, máy đo xem ngón tay **đi nhanh đến mức nào**. Phải vung đủ nhanh mới là chém; chạm chậm thì không tính.
5. **Bấm nút bằng tay:** giữ ngón tay trên nút khoảng 1 giây, thanh vàng chạy đầy là nút được bấm.
6. **Đề toán không bao giờ hết:** máy chọn số **ngẫu nhiên** rồi tự tính đáp án, nên mỗi lần chơi lại có đề mới.
7. **Quả bay cong như thật:** ở trò Ninja, mỗi khoảnh khắc trái cây lại bị **trọng lực** kéo xuống một chút, nên nó bay lên chậm dần rồi rơi xuống, giống như khi tung một quả bóng.
8. **An toàn – công dân số:** hình ảnh chỉ được xử lý **ngay trên máy tính này**, không chụp, không lưu, không gửi lên mạng. Tắt trang web là camera tắt.

## Giải thích kỹ thuật (cho người lớn và giám khảo)

| Phần | Công nghệ | Ở đâu |
|---|---|---|
| Giao diện, đồ họa | HTML5 Canvas, TypeScript, không dùng framework | `src/app.ts`, `src/scenes/` |
| Camera | `getUserMedia`, vẽ lật ngang (mirror) phủ kín màn hình | `src/core/camera.ts` |
| Nhận diện tay | MediaPipe Hand Landmarker (WebAssembly, chạy trong trình duyệt), tối đa 4 bàn tay, dùng điểm số 8 (đầu ngón trỏ) | `src/core/hand-tracker.ts` |
| Đầu vào | Ghép ngón tay của khung hình trước với khung hình sau theo khoảng cách gần nhất, làm mượt vị trí, tính tốc độ; chuột dùng thay khi không có camera | `src/core/input.ts` |
| Chạm / chém | Chỉ tính khi con trỏ **đi vào** vùng (`TouchTracker`); chém = đoạn di chuyển cắt qua hình tròn và tốc độ trên 650 px/s | `src/games/round-kit.ts` |
| Nút bấm rảnh tay | Giữ khoảng 1 giây; nút chỉ nhận khi tay đã rời ra một lần, để tránh bấm nhầm khi vừa chuyển màn hình | `src/core/dwell-button.ts` |
| Âm thanh | Tạo bằng Web Audio, không cần file âm thanh | `src/core/audio.ts` |
| Sinh đề toán | Hàm thuần, có **34 bài kiểm thử tự động** (ví dụ: đáp án luôn đúng, đáp án sai không trùng nhau, siêu thị luôn có lời giải) | `src/math/`, `tests/math.test.ts` |
| Chạy khi không có mạng | Thư viện WebAssembly và mô hình nhận diện tay (khoảng 7,5 MB) được chép vào `public/mediapipe/` khi build | `scripts/vendor-mediapipe.mjs` |

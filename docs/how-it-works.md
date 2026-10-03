# Math Frog hoạt động thế nào?

## Giải thích cho học sinh (để các em tự kể với giám khảo)

1. **Hai phần: Học và Luyện tập.** Phần Học giống một lớp học: ếch Green giảng lý thuyết, giải ví dụ, rồi cho bài tập để em nhập đáp án. Phần Luyện tập là trò chơi: em đứng trước camera và giơ tay chọn đáp án.
2. **Camera nhìn thấy em.** Ở phần Luyện tập, website lấy hình từ webcam và hiện lên màn hình **như một tấm gương**.
3. **Máy tìm ngón tay trỏ.** Website có một "bộ não nhỏ" là trí tuệ nhân tạo (AI) **MediaPipe**. Nó đã được dạy bằng rất nhiều ảnh bàn tay, nên tìm ra **21 điểm** trên mỗi bàn tay. Trò chơi chỉ dùng **đầu ngón tay trỏ**, là chấm tròn vàng trên màn hình.
4. **Chạm là gì?** Chấm vàng vừa **đi vào** quả táo hay lá sen là máy tính coi như em đã chạm. Để tay đứng yên trong đó thì vẫn chỉ tính một lần.
5. **Bấm nút bằng tay:** giữ ngón tay trên nút khoảng 1 giây, thanh vàng chạy đầy là nút được bấm.
6. **Đề toán không bao giờ hết:** máy chọn số **ngẫu nhiên** rồi tự tính đáp án. Đáp án sai là những lỗi hay gặp, ví dụ đặt nhầm dấu phẩy.
7. **Màn hình trôi ở trò Nhảy Lá Sen:** mỗi khoảnh khắc, mặt hồ dịch sang trái một chút. Màn càng cao thì hồ trôi càng nhanh, nên phải tính nhanh hơn.
8. **Kinh nghiệm và hạng:** mỗi câu đúng được 10 KN. Máy cộng KN lại rồi so với các mốc 100, 300, 600… để biết em đang ở hạng nào.
9. **Nhạc nền và tiếng ếch:** máy tự tạo ra từng nốt nhạc và tiếng "ộp ộp", nên không cần file âm thanh và không cần mạng. Lời khen khi đúng và câu "Đói quá!" khi sai do giọng đọc tiếng Việt có sẵn trong máy tính đọc lên.
10. **An toàn – công dân số:** hình ảnh chỉ được xử lý **ngay trên máy tính này**, không chụp, không lưu, không gửi lên mạng. KN cũng chỉ lưu trên máy này.

## Giải thích kỹ thuật (cho người lớn và giám khảo)

| Phần | Công nghệ | Ở đâu |
|---|---|---|
| Giao diện, đồ họa | HTML5 Canvas, TypeScript, không dùng framework; ếch Green, lá sen, táo đều vẽ bằng code | `src/app.ts`, `src/scenes/`, `src/core/frog-art.ts` |
| Camera | `getUserMedia`, vẽ lật ngang (mirror) phủ kín màn hình | `src/core/camera.ts` |
| Nhận diện tay | MediaPipe Hand Landmarker (WebAssembly, chạy trong trình duyệt), tối đa 4 bàn tay, dùng điểm số 8 (đầu ngón trỏ) | `src/core/hand-tracker.ts` |
| Đầu vào | Ghép ngón tay giữa các khung hình, làm mượt vị trí, tính tốc độ; dùng chuột khi không có camera; nhận phím số khi nhập đáp án | `src/core/input.ts` |
| Nút bấm rảnh tay | Giữ khoảng 1 giây; nút chỉ nhận khi tay đã rời ra một lần, để tránh bấm nhầm khi vừa chuyển màn hình | `src/core/dwell-button.ts` |
| 3 trò Math Frog | Mỗi màn là một thử thách (số câu đúng cần đạt, thời gian, tốc độ trôi) | `src/games/frog/` |
| Đề toán lớp 5 | Hàm thuần; tính bằng số nguyên (phần mười, phần trăm, phần nghìn) để tránh sai số của số thập phân | `src/math/grade5.ts` |
| Kiểm tra đáp án nhập | Chấp nhận "2,5", "2.5", "2,50" | `src/math/answer-check.ts` |
| Bài học | Nội dung 4 chương là dữ liệu, sửa được mà không cần sửa code; mỗi trang lý thuyết có hình động vẽ bằng Canvas | `src/data/lessons.ts`, `src/scenes/lesson-art.ts` |
| KN, hạng, màn đã qua | `localStorage` của trình duyệt | `src/core/progress.ts` |
| Âm thanh, nhạc nền | Tạo bằng Web Audio (C – Am – F – G, có tiếng vang nhẹ; tiếng ếch là sóng răng cưa bị "băm" 38 lần mỗi giây), không cần file âm thanh | `src/core/audio.ts`, `src/core/music.ts` |
| Giọng nói của ếch | Web Speech API, ưu tiên giọng tiếng Việt cài sẵn trong máy; lời khen cách nhau ít nhất 1,5 giây; không có giọng thì kêu ộp | `src/core/voice.ts` |
| Ếch trong 9 trò cũ | `FrogBuddy`: nhảy khi đúng, buồn khi sai, há miệng, thè lưỡi | `src/games/frog-buddy.ts`, `src/games/round-kit.ts` |
| Kiểm thử | Vitest: đề toán luôn đúng, đáp án sai không trùng nhau, nội dung bài học hợp lệ, lưu và tải lại KN | `tests/` |
| Chạy khi không có mạng | Thư viện WebAssembly và mô hình nhận diện tay (khoảng 7,5 MB) được chép vào `public/mediapipe/` khi build | `scripts/vendor-mediapipe.mjs` |

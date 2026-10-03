# Kế hoạch: Toán Vận Động – website trò chơi học toán bằng camera

**Trạng thái:** Đã thay bằng [kế hoạch Math Frog](../261003-1924-math-frog/plan.md) (03/10). 9 trò trong kế hoạch này vẫn còn, đã đổi sang chủ đề ếch. · **Đội:** 2 học sinh lớp 5
**Tài liệu:** [ý tưởng](../../docs/product-idea.md) · [danh sách trò](../../docs/game-catalog.md) · [cách hoạt động](../../docs/how-it-works.md) · [chạy](../../docs/run-guide.md) · [thuyết trình](../../docs/pitch-and-qa.md)

## Đã làm (03/10)
- [x] Website Vite + TypeScript + Canvas; nhận diện tay bằng MediaPipe (tối đa 4 tay); tự chuyển sang chuột khi không có camera
- [x] 9 trò × 3 mức; chế độ 2 người cho trò 1, 2, 3, 5, 6; nút bấm bằng cách giữ tay; điểm và sao
- [x] Chạy khi không có mạng (thư viện và mô hình nằm sẵn trong `public/mediapipe/`, có `start-offline.bat`)
- [x] 34 bài kiểm thử cho phần sinh đề toán; typecheck và build sạch
- [x] Chạy thử tự động bằng Chrome không giao diện với camera giả: cả 9 trò, chế độ 2 người và màn hình kết quả đều chạy, không lỗi

## Việc tiếp theo
| Ngày | Việc | Ai làm | Xong khi |
|---|---|---|---|
| T7 03/10 | **Thử với webcam thật**: chơi cả 9 trò, ghi lại chỗ khó chạm hoặc chạm nhầm | Người lớn + cả hai bạn | Có danh sách góp ý (gửi trợ lý để chỉnh) |
| T7–CN | Hai bạn đọc và tự kể lại [how-it-works.md](../../docs/how-it-works.md) | Cả hai | Kể được không cần nhìn giấy |
| CN 04/10 | Luyện thuyết trình ít nhất 5 lần, có phần hỏi đáp | Cả hai | Trôi chảy trong 2 phút |
| CN 04/10 | Thử chạy `start-offline.bat` khi đã **ngắt wifi** | Người lớn | Mở được website, nhận diện tay chạy |
| **T2 05/10** | **Vòng 1 – Sơ loại** | | |
| T3–T4 | Mời 10–20 bạn chơi Bắt Bong Bóng 3 lượt; ghi điểm lượt 1 và lượt 3; phát phiếu "thích hay không" | Cả hai | Có số liệu |
| T4–T5 | Soạn thêm câu hỏi đổi đơn vị và món hàng siêu thị; sửa theo góp ý của giám khảo | B + người lớn | `npm test` vẫn đạt hết |
| T5 08/10 | Poster: vấn đề, 9 trò, sơ đồ cách hoạt động, biểu đồ số liệu; tổng duyệt | Cả hai | Poster in xong |
| **T6 09/10** | **Vòng 2 – Chung kết** | | |

## Đồ mang đi thi
Laptop có webcam, đã cài dự án và sạc đầy · sạc · loa · cáp HDMI nối TV hoặc máy chiếu · phông nền trơn (nếu có) · poster (vòng 2) · thẻ ghi ý chính.

## Việc còn mở
- Hỏi cô xem thể lệ có cho phép **người lớn hỗ trợ lập trình** không (rủi ro lớn nhất của hướng làm website).
- Chưa thử với **webcam thật và người thật**; ngưỡng tốc độ chém (650 px/s), độ mượt và cỡ các mục tiêu có thể phải chỉnh lại.
- Có đưa website lên mạng (GitHub Pages, Netlify…) không? Cần chủ dự án đồng ý.

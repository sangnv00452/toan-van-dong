# Ý tưởng sản phẩm: **Toán Vận Động** – Website trò chơi học toán bằng camera

## 1. Vấn đề
- Học sinh ngồi gần như cả ngày: ngồi học, ra chơi lại ngồi xem điện thoại. Ít vận động dễ mỏi lưng, cận thị, béo phì.
- Ôn bảng cửu chương, phân số, đổi đơn vị bằng cách chép đi chép lại thì rất chán, nhiều bạn sợ môn Toán.
- Những hôm mưa hoặc nắng nóng, lớp không ra sân được, giờ ra chơi trong lớp ồn và lộn xộn.

## 2. Giải pháp
Một **website** mở bằng trình duyệt Chrome hoặc Edge trên máy tính có **webcam**, chiếu lên TV hoặc máy chiếu của lớp. Học sinh **đứng dậy, giơ tay, vung tay** để chạm vào đáp án trên màn hình, không cần chuột hay bàn phím.

- **9 trò chơi**, mỗi trò luyện một mạch toán khác nhau, mỗi trò có **3 mức** (Dễ, Vừa, Khó) từ lớp 1 đến lớp 5. Chi tiết: [game-catalog.md](./game-catalog.md).
- **Chế độ 2 người đấu**: chia đôi màn hình, mỗi bạn chơi một nửa.
- **Chọn bằng tay**: chỉ tay vào nút và giữ yên khoảng 1 giây để bấm.
- **Chạy được khi không có mạng**: toàn bộ thư viện và mô hình nhận diện tay đã nằm sẵn trong thư mục dự án.
- **Không có camera vẫn chơi được bằng chuột**.

Cách hoạt động, giải thích cho học sinh và cho giám khảo: [how-it-works.md](./how-it-works.md). Cách cài đặt và chạy: [run-guide.md](./run-guide.md).

## 3. Vì sao hợp tiêu chí cuộc thi
| Tiêu chí bảng 3–5 | Toán Vận Động đáp ứng thế nào |
|---|---|
| **Học tập** | Ôn đủ các mạch toán: số học, so sánh, chia hết, tiền, phân số, hình học, thời gian, quy luật, khối lượng |
| **Môi trường** | Không cần in phiếu bài tập; dùng lại máy tính và TV có sẵn |
| **Cuộc sống số / Công dân số** | Camera **chỉ dùng để tìm vị trí ngón tay ngay trên máy**: không chụp, không lưu, không gửi hình đi đâu. Website nói rõ điều này ở màn hình đầu tiên. |
| **Trường học thông minh** | Lớp nào có máy tính và webcam là dùng được; trò chơi dùng trí tuệ nhân tạo (AI) nhận diện bàn tay |
| **Trình diễn** | Mời giám khảo đứng lên chơi, hoặc đấu 2 người với đội |

## 4. Phân vai cho 2 bạn
Phần lập trình website do người lớn hỗ trợ. Hai bạn nhỏ làm phần **ý tưởng, nội dung, thử nghiệm và trình bày**, và phải hiểu, giải thích được **cách hoạt động** của sản phẩm.

| Bạn | Việc chính |
|---|---|
| **Bạn A – Thiết kế trò chơi & thử nghiệm** | Chơi thử cả 9 trò, ghi lại trò nào khó hay dễ quá, lỗi gì; tổ chức cho các bạn trong lớp chơi thử và ghi điểm |
| **Bạn B – Nội dung & trình bày** | Soạn thêm câu hỏi đổi đơn vị (`src/data/unit-comparisons.ts`) và món hàng siêu thị (`src/data/shop-items.ts`) cùng người lớn; làm poster |
| **Cả hai** | Hiểu và tự kể được [how-it-works.md](./how-it-works.md), luyện thuyết trình ([pitch-and-qa.md](./pitch-and-qa.md)) |

## 5. Vật liệu
| Thứ | Bắt buộc? | Ghi chú |
|---|---|---|
| Máy tính có **webcam** và trình duyệt **Chrome** hoặc **Edge** | Có | Đã cài dự án theo [run-guide.md](./run-guide.md) |
| Màn hình lớn hoặc máy chiếu, loa | Nên có | Người chơi đứng cách màn hình khoảng 1,5–2 m |
| Phông nền trơn phía sau người chơi | Nên có | Nhận diện tay ổn định hơn |
| Poster A0 hoặc A1 | Vòng 2 | Vấn đề, 9 trò chơi, cách hoạt động, số liệu khảo sát |

## 6. Rủi ro và cách xử lý
| Rủi ro | Cách xử lý |
|---|---|
| Giám khảo hỏi "Các em lập trình thế nào?" | Trả lời trung thực: người lớn hỗ trợ viết code; các em làm ý tưởng, nội dung, thử nghiệm; các em giải thích được cách hoạt động (xem Q&A trong [pitch-and-qa.md](./pitch-and-qa.md)). Hỏi trước cô giáo xem thể lệ có cho phép người lớn hỗ trợ lập trình không. |
| Phòng thi tối hoặc ngược sáng, tay khó nhận | Đứng quay mặt về phía nguồn sáng; thử trước ở nơi thi |
| Không có mạng | Chạy `start-offline.bat`, không cần Internet |
| Camera hỏng hoặc bị chặn | Website tự chuyển sang chơi bằng chuột |
| Người đứng sau lưng cũng giơ tay | Chỉ có ngón tay mới được tính; mời khán giả đứng ngoài khung hình |

## 7. Các ý tưởng đã cân nhắc
| Ý tưởng | Lý do không chọn |
|---|---|
| Làm bằng Scratch (các em tự lập trình) | Đội chọn làm website để có nhận diện bàn tay chính xác và giao diện đẹp hơn |
| Thỏ Tai Thính – máy đo tiếng ồn lớp học | Đội chọn hướng dùng camera |
| Trợ lý soạn cặp sách, Hộp thư cảm xúc, Từ điển hình ảnh biết nói | Ít vận động, khi trình diễn ít bất ngờ hơn |

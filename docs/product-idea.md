# Ý tưởng sản phẩm: **Math Frog** – Học toán lớp 5 cùng ếch Green

Hai bạn trong đội tự nghĩ ra Math Frog và viết bản mô tả: [game-ideas/01-math-frog.md](./game-ideas/01-math-frog.md). Website lúc đầu có tên "Toán Vận Động", gồm 9 trò chơi; 9 trò đó nay đã đổi sang chủ đề ếch và nằm trong phần Luyện tập.

## 1. Vấn đề
- Học sinh ngồi gần như cả ngày: ngồi học, ra chơi lại ngồi xem điện thoại. Ít vận động dễ mỏi lưng, cận thị, béo phì.
- Toán lớp 5 có nhiều bài khó (số thập phân, phần trăm, diện tích, vận tốc). Ôn bằng cách chép đi chép lại thì rất chán, nhiều bạn sợ môn Toán.
- Những hôm mưa hoặc nắng nóng, lớp không ra sân được, giờ ra chơi trong lớp ồn và lộn xộn.

## 2. Giải pháp
Một **website** mở bằng trình duyệt Chrome hoặc Edge trên máy tính có **webcam**, chiếu lên TV hoặc máy chiếu của lớp. Nhân vật chính là **ếch Green**. Trang chủ là một cái hồ có nhạc nền nhẹ, góc phải có hai phần:

- **Học:** 4 chương Toán lớp 5. Ếch thầy giáo giảng lý thuyết, giải ví dụ, rồi cho bài tập để nhập đáp án.
- **Luyện tập:** học sinh **đứng dậy, giơ tay** trước camera để chạm vào đáp án. Có 3 trò Math Frog (Ếch Ăn Táo, Nhảy Lá Sen, Táo Băng; mỗi trò 3 mức × 5 màn) và 9 trò chơi khác của Green.
- Mỗi câu đúng được **điểm kinh nghiệm (KN)** để leo hạng, từ Nòng nọc lên Vua ếch.

- Chi tiết các chương, trò chơi và màn chơi: [game-catalog.md](./game-catalog.md).
- **Chế độ 2 người đấu** (ở 5 trong 9 trò khác): chia đôi màn hình, mỗi bạn chơi một nửa.
- **Chọn bằng tay**: chỉ tay vào nút và giữ yên khoảng 1 giây để bấm.
- **Chạy được khi không có mạng**: toàn bộ thư viện và mô hình nhận diện tay đã nằm sẵn trong thư mục dự án.
- **Không có camera vẫn chơi được bằng chuột**.

Cách hoạt động, giải thích cho học sinh và cho giám khảo: [how-it-works.md](./how-it-works.md). Cách cài đặt và chạy: [run-guide.md](./run-guide.md).

## 3. Vì sao hợp tiêu chí cuộc thi
| Tiêu chí bảng 3–5 | Math Frog đáp ứng thế nào |
|---|---|
| **Học tập** | Có cả phần học lý thuyết lẫn luyện tập: số thập phân, tỉ số phần trăm, hình học, thời gian và chuyển động (lớp 5), cùng 9 trò ôn lớp 1–5 |
| **Môi trường** | Không cần in phiếu bài tập; dùng lại máy tính và TV có sẵn |
| **Cuộc sống số / Công dân số** | Camera **chỉ dùng để tìm vị trí ngón tay ngay trên máy**: không chụp, không lưu, không gửi hình đi đâu. Website nói rõ điều này ở màn hình đầu tiên. |
| **Trường học thông minh** | Lớp nào có máy tính và webcam là dùng được; trò chơi dùng trí tuệ nhân tạo (AI) nhận diện bàn tay |
| **Trình diễn** | Mời giám khảo đứng lên chơi, hoặc đấu 2 người với đội |

## 4. Phân vai cho 2 bạn
Hai bạn nhỏ **tự nghĩ ra sản phẩm** (tên, nhân vật, các phần, luật chơi) và viết bản mô tả. Phần lập trình do người lớn và trợ lý AI hỗ trợ. Hai bạn làm tiếp phần **thử nghiệm, góp ý, nội dung và trình bày**, và phải hiểu, giải thích được **cách hoạt động** của sản phẩm.

| Bạn | Việc chính |
|---|---|
| **Bạn A – Thiết kế trò chơi & thử nghiệm** | Chơi thử 3 trò Math Frog qua các màn, ghi góp ý vào [phiếu mô tả](./game-ideas/01-math-frog.md); tổ chức cho các bạn trong lớp chơi thử và ghi điểm |
| **Bạn B – Nội dung & trình bày** | Đọc lại các bài học trong `src/data/lessons.ts`, sửa chỗ khó hiểu và thêm bài tập cùng người lớn; làm poster |
| **Cả hai** | Hiểu và tự kể được [how-it-works.md](./how-it-works.md), luyện thuyết trình ([pitch-and-qa.md](./pitch-and-qa.md)) |

## 5. Vật liệu
| Thứ | Bắt buộc? | Ghi chú |
|---|---|---|
| Máy tính có **webcam** và trình duyệt **Chrome** hoặc **Edge** | Có | Đã cài dự án theo [run-guide.md](./run-guide.md) |
| Màn hình lớn hoặc máy chiếu, loa | Nên có | Người chơi đứng cách màn hình khoảng 1,5–2 m |
| Phông nền trơn phía sau người chơi | Nên có | Nhận diện tay ổn định hơn |
| Poster A0 hoặc A1 | Vòng 2 | Vấn đề, ếch Green, phần Học và 3 trò chơi, cách hoạt động, số liệu khảo sát |

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

/**
 * Nội dung phần Học (Toán lớp 5). Hai bạn có thể sửa hoặc thêm chủ đề ở đây.
 * Đáp án bài tập phải là MỘT SỐ (dùng dấu phẩy cho số thập phân, ví dụ "17,5").
 * Sửa xong chạy `npm test` để máy kiểm tra đáp án viết đúng kiểu.
 */

export interface Example {
  problem: string;
  steps: string[];
}

export interface Exercise {
  q: string;
  answer: string;
  /** Đơn vị hiện sau ô nhập, ví dụ "cm²". */
  unit?: string;
  /** Lời giải ngắn, hiện ra sau khi bấm Kiểm tra. */
  explain: string;
}

export interface Topic {
  id: string;
  title: string;
  theory: string[];
  examples: Example[];
  exercises: Exercise[];
}

export interface Chapter {
  id: string;
  title: string;
  icon: string;
  color: string;
  topics: Topic[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'decimals',
    title: 'Số thập phân',
    icon: '🔢',
    color: '#3a86ff',
    topics: [
      {
        id: 'decimals-intro',
        title: 'Số thập phân là gì?',
        theory: [
          'Số thập phân có hai phần. Phần nguyên ở bên trái dấu phẩy, phần thập phân ở bên phải dấu phẩy. Ví dụ 3,75: phần nguyên là 3, phần thập phân là 75.',
          'Phân số thập phân viết được thành số thập phân: 1/10 = 0,1; 1/100 = 0,01; 1/1000 = 0,001. Mẫu số có bao nhiêu chữ số 0 thì sau dấu phẩy có bấy nhiêu chữ số.',
          'So sánh hai số thập phân: so phần nguyên trước. Nếu phần nguyên bằng nhau thì so lần lượt hàng phần mười, hàng phần trăm… Chú ý: 3,5 lớn hơn 3,45 vì 5 phần mười lớn hơn 4 phần mười.',
        ],
        examples: [
          { problem: 'Viết 37/100 thành số thập phân.', steps: ['Mẫu số 100 có 2 chữ số 0.', 'Vậy sau dấu phẩy có 2 chữ số.', '37/100 = 0,37'] },
          { problem: 'Số nào lớn hơn: 2,8 hay 2,75?', steps: ['Phần nguyên bằng nhau, đều là 2.', 'So hàng phần mười: 8 > 7.', 'Vậy 2,8 > 2,75.'] },
        ],
        exercises: [
          { q: 'Viết 7/10 thành số thập phân.', answer: '0,7', explain: '7/10 = 0,7 (mẫu có một chữ số 0 nên sau dấu phẩy có một chữ số).' },
          { q: 'Viết 45/100 thành số thập phân.', answer: '0,45', explain: '45/100 = 0,45 (mẫu có hai chữ số 0).' },
          { q: 'Viết hỗn số 3 và 6/10 thành số thập phân.', answer: '3,6', explain: 'Phần nguyên là 3, phần thập phân là 6 phần mười: 3,6.' },
          { q: 'Số lớn nhất trong ba số 4,09; 4,9; 4,19 là số nào?', answer: '4,9', explain: 'Phần nguyên đều là 4. Hàng phần mười: 0, 9, 1. Vậy 4,9 lớn nhất.' },
        ],
      },
      {
        id: 'decimals-add-sub',
        title: 'Cộng, trừ số thập phân',
        theory: [
          'Muốn cộng hoặc trừ hai số thập phân, ta đặt tính sao cho các chữ số cùng hàng thẳng cột với nhau, dấu phẩy thẳng dấu phẩy.',
          'Sau đó cộng hoặc trừ như số tự nhiên, rồi đặt dấu phẩy ở kết quả thẳng cột với các dấu phẩy ở trên.',
          'Nếu phần thập phân của hai số không dài bằng nhau, ta viết thêm chữ số 0 vào bên phải cho đủ: 5,4 = 5,40.',
        ],
        examples: [
          { problem: '12,5 + 3,75 = ?', steps: ['Viết 12,5 thành 12,50 cho đủ hai chữ số sau dấu phẩy.', '12,50 + 3,75 = 16,25'] },
          { problem: '8,3 − 2,46 = ?', steps: ['Viết 8,3 thành 8,30.', '8,30 − 2,46 = 5,84'] },
        ],
        exercises: [
          { q: '4,6 + 2,3 = ?', answer: '6,9', explain: '46 + 23 = 69, đặt dấu phẩy: 6,9.' },
          { q: '15,25 + 4,8 = ?', answer: '20,05', explain: '15,25 + 4,80 = 20,05.' },
          { q: '9,7 − 3,45 = ?', answer: '6,25', explain: '9,70 − 3,45 = 6,25.' },
          { q: 'Mẹ mua 2,5 kg táo và 1,75 kg cam. Mẹ mua tất cả bao nhiêu ki-lô-gam?', answer: '4,25', unit: 'kg', explain: '2,50 + 1,75 = 4,25 (kg).' },
        ],
      },
      {
        id: 'decimals-mul-div',
        title: 'Nhân, chia số thập phân',
        theory: [
          'Nhân số thập phân với số tự nhiên: nhân như số tự nhiên. Số thập phân có bao nhiêu chữ số sau dấu phẩy thì tách ở kết quả bấy nhiêu chữ số.',
          'Nhân với 10, 100, 1000: chuyển dấu phẩy sang PHẢI 1, 2, 3 chữ số. Chia cho 10, 100, 1000: chuyển dấu phẩy sang TRÁI 1, 2, 3 chữ số.',
          'Chia số thập phân cho số tự nhiên: chia phần nguyên trước, viết dấu phẩy vào thương, rồi chia tiếp phần thập phân.',
        ],
        examples: [
          { problem: '2,35 × 4 = ?', steps: ['235 × 4 = 940.', '2,35 có 2 chữ số sau dấu phẩy, nên tách 2 chữ số: 9,40.', '2,35 × 4 = 9,4'] },
          { problem: '12,6 : 3 = ?', steps: ['12 : 3 = 4, viết 4 rồi viết dấu phẩy.', 'Hạ 6 xuống: 6 : 3 = 2.', '12,6 : 3 = 4,2'] },
        ],
        exercises: [
          { q: '1,25 × 4 = ?', answer: '5', explain: '125 × 4 = 500, tách 2 chữ số: 5,00 = 5.' },
          { q: '3,47 × 100 = ?', answer: '347', explain: 'Nhân với 100: chuyển dấu phẩy sang phải 2 chữ số: 347.' },
          { q: '56,4 : 10 = ?', answer: '5,64', explain: 'Chia cho 10: chuyển dấu phẩy sang trái 1 chữ số: 5,64.' },
          { q: '18,6 : 6 = ?', answer: '3,1', explain: '18 : 6 = 3, viết dấu phẩy; 6 : 6 = 1. Kết quả 3,1.' },
        ],
      },
    ],
  },
  {
    id: 'percent',
    title: 'Tỉ số phần trăm',
    icon: '💯',
    color: '#fb8500',
    topics: [
      {
        id: 'percent-intro',
        title: 'Tỉ số phần trăm là gì?',
        theory: [
          'Tỉ số phần trăm cho biết một số bằng bao nhiêu phần trăm số kia. 25% đọc là "hai mươi lăm phần trăm", nghĩa là 25/100.',
          'Muốn tìm tỉ số phần trăm của a và b: lấy a chia cho b, nhân thương với 100, rồi viết thêm kí hiệu % vào bên phải.',
        ],
        examples: [
          { problem: 'Lớp có 40 bạn, trong đó 18 bạn nữ. Số bạn nữ chiếm bao nhiêu phần trăm?', steps: ['18 : 40 = 0,45', '0,45 × 100 = 45', 'Số bạn nữ chiếm 45%.'] },
          { problem: 'Viết 3/4 thành tỉ số phần trăm.', steps: ['3/4 = 75/100', '75/100 = 75%'] },
        ],
        exercises: [
          { q: 'Viết 0,35 thành tỉ số phần trăm.', answer: '35', unit: '%', explain: '0,35 × 100 = 35, vậy 0,35 = 35%.' },
          { q: 'Tỉ số phần trăm của 12 và 50 là bao nhiêu?', answer: '24', unit: '%', explain: '12 : 50 = 0,24 = 24%.' },
          { q: 'Viết 1/2 thành tỉ số phần trăm.', answer: '50', unit: '%', explain: '1/2 = 50/100 = 50%.' },
          { q: 'Lớp có 25 bạn, 15 bạn thích bóng đá. Số bạn thích bóng đá chiếm bao nhiêu phần trăm?', answer: '60', unit: '%', explain: '15 : 25 = 0,6 = 60%.' },
        ],
      },
      {
        id: 'percent-of',
        title: 'Tìm phần trăm của một số',
        theory: [
          'Muốn tìm 20% của 150, ta lấy 150 chia cho 100 rồi nhân với 20. Hoặc lấy 150 nhân với 20 rồi chia cho 100.',
          'Mẹo tính nhẩm: 10% là chia cho 10; 50% là lấy một nửa; 25% là chia cho 4.',
        ],
        examples: [
          { problem: 'Tìm 15% của 200.', steps: ['200 : 100 = 2', '2 × 15 = 30', '15% của 200 là 30.'] },
          { problem: 'Chiếc áo giá 80 000 đồng, được giảm 25%. Được giảm bao nhiêu tiền?', steps: ['25% là một phần tư.', '80 000 : 4 = 20 000', 'Được giảm 20 000 đồng.'] },
        ],
        exercises: [
          { q: '10% của 350 là bao nhiêu?', answer: '35', explain: '10% là chia cho 10: 350 : 10 = 35.' },
          { q: '50% của 86 là bao nhiêu?', answer: '43', explain: '50% là một nửa: 86 : 2 = 43.' },
          { q: '20% của 450 là bao nhiêu?', answer: '90', explain: '450 : 100 × 20 = 90.' },
          { q: 'Trường có 600 học sinh, 45% là học sinh nữ. Trường có bao nhiêu học sinh nữ?', answer: '270', unit: 'học sinh', explain: '600 : 100 × 45 = 270.' },
        ],
      },
      {
        id: 'percent-whole',
        title: 'Tìm một số khi biết phần trăm',
        theory: [
          'Biết 30% của một số là 45. Muốn tìm số đó, ta lấy 45 chia cho 30 rồi nhân với 100.',
          'Hiểu đơn giản: tìm 1% của số đó trước, rồi nhân lên thành 100%.',
        ],
        examples: [
          { problem: '20% của một số là 16. Tìm số đó.', steps: ['1% của số đó là 16 : 20 = 0,8', '100% là 0,8 × 100 = 80', 'Số đó là 80.'] },
          { problem: 'Lớp có 12 bạn nam, chiếm 40% số học sinh cả lớp. Lớp có bao nhiêu bạn?', steps: ['12 : 40 × 100 = 30', 'Lớp có 30 bạn.'] },
        ],
        exercises: [
          { q: '10% của một số là 7. Số đó là bao nhiêu?', answer: '70', explain: '7 : 10 × 100 = 70.' },
          { q: '25% của một số là 15. Số đó là bao nhiêu?', answer: '60', explain: '15 : 25 × 100 = 60.' },
          { q: '50% của một số là 34. Số đó là bao nhiêu?', answer: '68', explain: '50% là một nửa, nên số đó là 34 × 2 = 68.' },
          { q: 'An đã đọc 45 trang, bằng 30% số trang của quyển sách. Quyển sách có bao nhiêu trang?', answer: '150', unit: 'trang', explain: '45 : 30 × 100 = 150.' },
        ],
      },
    ],
  },
  {
    id: 'geometry',
    title: 'Hình học',
    icon: '📐',
    color: '#2ec27e',
    topics: [
      {
        id: 'geometry-triangle',
        title: 'Diện tích hình tam giác',
        theory: [
          'Muốn tính diện tích hình tam giác, ta lấy độ dài đáy nhân với chiều cao (cùng đơn vị đo) rồi chia cho 2.',
          'Công thức: S = a × h : 2, trong đó a là độ dài đáy, h là chiều cao.',
          'Chiều cao là đoạn thẳng đi từ một đỉnh và vuông góc với cạnh đáy.',
        ],
        examples: [
          { problem: 'Tam giác có đáy 8 cm, chiều cao 5 cm. Tính diện tích.', steps: ['S = 8 × 5 : 2', '= 40 : 2 = 20 (cm²)'] },
          { problem: 'Tam giác vuông có hai cạnh góc vuông 6 cm và 4 cm. Tính diện tích.', steps: ['Một cạnh góc vuông là đáy, cạnh kia là chiều cao.', 'S = 6 × 4 : 2 = 12 (cm²)'] },
        ],
        exercises: [
          { q: 'Tam giác có đáy 10 cm, chiều cao 6 cm. Diện tích là bao nhiêu?', answer: '30', unit: 'cm²', explain: '10 × 6 : 2 = 30 (cm²).' },
          { q: 'Tam giác có đáy 7 cm, chiều cao 5 cm. Diện tích là bao nhiêu?', answer: '17,5', unit: 'cm²', explain: '7 × 5 : 2 = 35 : 2 = 17,5 (cm²).' },
          { q: 'Tam giác vuông có hai cạnh góc vuông 9 cm và 4 cm. Diện tích là bao nhiêu?', answer: '18', unit: 'cm²', explain: '9 × 4 : 2 = 18 (cm²).' },
          { q: 'Tam giác có đáy 2,5 m, chiều cao 4 m. Diện tích là bao nhiêu?', answer: '5', unit: 'm²', explain: '2,5 × 4 : 2 = 10 : 2 = 5 (m²).' },
        ],
      },
      {
        id: 'geometry-trapezoid',
        title: 'Diện tích hình thang',
        theory: [
          'Hình thang có hai cạnh đáy song song với nhau: đáy lớn và đáy bé.',
          'Muốn tính diện tích hình thang, ta lấy tổng độ dài hai đáy nhân với chiều cao (cùng đơn vị đo) rồi chia cho 2.',
          'Công thức: S = (a + b) × h : 2.',
        ],
        examples: [
          { problem: 'Hình thang có đáy lớn 12 cm, đáy bé 8 cm, chiều cao 5 cm. Tính diện tích.', steps: ['a + b = 12 + 8 = 20', 'S = 20 × 5 : 2 = 50 (cm²)'] },
          { problem: 'Thửa ruộng hình thang có hai đáy 30 m và 20 m, chiều cao 10 m. Tính diện tích.', steps: ['(30 + 20) × 10 : 2', '= 50 × 10 : 2 = 250 (m²)'] },
        ],
        exercises: [
          { q: 'Hình thang có hai đáy 9 cm và 5 cm, chiều cao 4 cm. Diện tích là bao nhiêu?', answer: '28', unit: 'cm²', explain: '(9 + 5) × 4 : 2 = 28 (cm²).' },
          { q: 'Hình thang có hai đáy 15 m và 11 m, chiều cao 6 m. Diện tích là bao nhiêu?', answer: '78', unit: 'm²', explain: '(15 + 11) × 6 : 2 = 26 × 6 : 2 = 78 (m²).' },
          { q: 'Hình thang có hai đáy 7 cm và 4 cm, chiều cao 3 cm. Diện tích là bao nhiêu?', answer: '16,5', unit: 'cm²', explain: '(7 + 4) × 3 : 2 = 33 : 2 = 16,5 (cm²).' },
          { q: 'Hình thang có hai đáy 2,5 dm và 1,5 dm, chiều cao 2 dm. Diện tích là bao nhiêu?', answer: '4', unit: 'dm²', explain: '(2,5 + 1,5) × 2 : 2 = 4 (dm²).' },
        ],
      },
      {
        id: 'geometry-circle',
        title: 'Hình tròn',
        theory: [
          'Bán kính r là đoạn thẳng nối tâm với một điểm trên đường tròn. Đường kính d dài gấp đôi bán kính: d = r × 2.',
          'Chu vi hình tròn: C = d × 3,14 (hoặc C = r × 2 × 3,14).',
          'Diện tích hình tròn: S = r × r × 3,14.',
        ],
        examples: [
          { problem: 'Hình tròn có đường kính 5 cm. Tính chu vi.', steps: ['C = 5 × 3,14 = 15,7 (cm)'] },
          { problem: 'Hình tròn có bán kính 3 cm. Tính diện tích.', steps: ['S = 3 × 3 × 3,14', '= 9 × 3,14 = 28,26 (cm²)'] },
        ],
        exercises: [
          { q: 'Hình tròn có bán kính 4 cm. Đường kính dài bao nhiêu?', answer: '8', unit: 'cm', explain: 'd = 4 × 2 = 8 (cm).' },
          { q: 'Hình tròn có đường kính 10 cm. Chu vi là bao nhiêu?', answer: '31,4', unit: 'cm', explain: 'C = 10 × 3,14 = 31,4 (cm).' },
          { q: 'Hình tròn có bán kính 2 cm. Diện tích là bao nhiêu?', answer: '12,56', unit: 'cm²', explain: 'S = 2 × 2 × 3,14 = 12,56 (cm²).' },
          { q: 'Hình tròn có bán kính 10 cm. Diện tích là bao nhiêu?', answer: '314', unit: 'cm²', explain: 'S = 10 × 10 × 3,14 = 314 (cm²).' },
        ],
      },
      {
        id: 'geometry-volume',
        title: 'Thể tích hình hộp',
        theory: [
          'Thể tích cho biết một hình chiếm bao nhiêu chỗ trong không gian. Đơn vị đo thể tích: cm³, dm³, m³. Ta có 1 dm³ = 1000 cm³.',
          'Hình hộp chữ nhật: V = chiều dài × chiều rộng × chiều cao (cùng đơn vị đo).',
          'Hình lập phương cạnh a: V = a × a × a.',
        ],
        examples: [
          { problem: 'Hình hộp chữ nhật dài 5 cm, rộng 4 cm, cao 3 cm. Tính thể tích.', steps: ['V = 5 × 4 × 3 = 60 (cm³)'] },
          { problem: 'Hình lập phương cạnh 3 dm. Tính thể tích.', steps: ['V = 3 × 3 × 3 = 27 (dm³)'] },
        ],
        exercises: [
          { q: 'Hình hộp chữ nhật dài 6 cm, rộng 5 cm, cao 2 cm. Thể tích là bao nhiêu?', answer: '60', unit: 'cm³', explain: 'V = 6 × 5 × 2 = 60 (cm³).' },
          { q: 'Hình lập phương cạnh 4 cm. Thể tích là bao nhiêu?', answer: '64', unit: 'cm³', explain: 'V = 4 × 4 × 4 = 64 (cm³).' },
          { q: 'Bể cá dài 8 dm, rộng 5 dm, cao 6 dm. Thể tích là bao nhiêu?', answer: '240', unit: 'dm³', explain: 'V = 8 × 5 × 6 = 240 (dm³).' },
          { q: '2 dm³ bằng bao nhiêu cm³?', answer: '2000', unit: 'cm³', explain: '1 dm³ = 1000 cm³, nên 2 dm³ = 2000 cm³.' },
        ],
      },
    ],
  },
  {
    id: 'motion',
    title: 'Thời gian và chuyển động',
    icon: '🚲',
    color: '#8338ec',
    topics: [
      {
        id: 'motion-time',
        title: 'Số đo thời gian',
        theory: [
          '1 giờ = 60 phút; 1 phút = 60 giây; 1 ngày = 24 giờ; 1 năm có 12 tháng; 1 thế kỉ = 100 năm.',
          'Đổi số giờ viết dạng thập phân ra phút: nhân với 60. Ví dụ 1,5 giờ = 1,5 × 60 = 90 phút.',
          'Cộng, trừ số đo thời gian: cộng (trừ) riêng từng loại đơn vị. Nếu số phút từ 60 trở lên thì đổi 60 phút thành 1 giờ.',
        ],
        examples: [
          { problem: '0,5 giờ bằng bao nhiêu phút?', steps: ['0,5 × 60 = 30', '0,5 giờ = 30 phút.'] },
          { problem: '2 giờ 45 phút + 1 giờ 30 phút = ?', steps: ['Cộng giờ: 2 + 1 = 3 giờ. Cộng phút: 45 + 30 = 75 phút.', '75 phút = 1 giờ 15 phút.', 'Kết quả: 4 giờ 15 phút.'] },
        ],
        exercises: [
          { q: '3 giờ bằng bao nhiêu phút?', answer: '180', unit: 'phút', explain: '3 × 60 = 180 (phút).' },
          { q: '2,5 giờ bằng bao nhiêu phút?', answer: '150', unit: 'phút', explain: '2,5 × 60 = 150 (phút).' },
          { q: '1,2 phút bằng bao nhiêu giây?', answer: '72', unit: 'giây', explain: '1,2 × 60 = 72 (giây).' },
          { q: 'Lan học từ 7 giờ 30 phút đến 10 giờ 15 phút. Lan học bao nhiêu phút?', answer: '165', unit: 'phút', explain: '10 giờ 15 phút − 7 giờ 30 phút = 2 giờ 45 phút = 165 phút.' },
        ],
      },
      {
        id: 'motion-speed',
        title: 'Vận tốc',
        theory: [
          'Vận tốc cho biết mỗi giờ (hoặc mỗi phút, mỗi giây) đi được bao nhiêu quãng đường.',
          'Muốn tính vận tốc, ta lấy quãng đường chia cho thời gian: v = s : t.',
          'Đơn vị của vận tốc: km/giờ, m/phút, m/giây.',
        ],
        examples: [
          { problem: 'Ô tô đi 150 km trong 3 giờ. Tính vận tốc.', steps: ['v = 150 : 3 = 50 (km/giờ)'] },
          { problem: 'Minh chạy 400 m trong 80 giây. Tính vận tốc.', steps: ['v = 400 : 80 = 5 (m/giây)'] },
        ],
        exercises: [
          { q: 'Xe máy đi 120 km trong 3 giờ. Vận tốc là bao nhiêu?', answer: '40', unit: 'km/giờ', explain: '120 : 3 = 40 (km/giờ).' },
          { q: 'Người đi bộ đi 10 km trong 2 giờ. Vận tốc là bao nhiêu?', answer: '5', unit: 'km/giờ', explain: '10 : 2 = 5 (km/giờ).' },
          { q: 'Ca nô đi 75 km trong 2,5 giờ. Vận tốc là bao nhiêu?', answer: '30', unit: 'km/giờ', explain: '75 : 2,5 = 30 (km/giờ).' },
          { q: 'Ếch Green nhảy được 60 m trong 30 giây. Vận tốc là bao nhiêu?', answer: '2', unit: 'm/giây', explain: '60 : 30 = 2 (m/giây).' },
        ],
      },
      {
        id: 'motion-distance-time',
        title: 'Quãng đường và thời gian',
        theory: [
          'Muốn tính quãng đường, ta lấy vận tốc nhân với thời gian: s = v × t.',
          'Muốn tính thời gian, ta lấy quãng đường chia cho vận tốc: t = s : v.',
          'Nhớ dùng cùng đơn vị: vận tốc tính bằng km/giờ thì thời gian tính bằng giờ.',
        ],
        examples: [
          { problem: 'Xe đạp đi với vận tốc 12 km/giờ trong 2,5 giờ. Tính quãng đường.', steps: ['s = 12 × 2,5 = 30 (km)'] },
          { problem: 'Ô tô đi quãng đường 180 km với vận tốc 45 km/giờ. Tính thời gian.', steps: ['t = 180 : 45 = 4 (giờ)'] },
        ],
        exercises: [
          { q: 'Vận tốc 40 km/giờ, đi trong 3 giờ. Quãng đường dài bao nhiêu?', answer: '120', unit: 'km', explain: '40 × 3 = 120 (km).' },
          { q: 'Vận tốc 15 km/giờ, đi trong 1,5 giờ. Quãng đường dài bao nhiêu?', answer: '22,5', unit: 'km', explain: '15 × 1,5 = 22,5 (km).' },
          { q: 'Quãng đường 200 km, vận tốc 50 km/giờ. Đi hết bao nhiêu giờ?', answer: '4', unit: 'giờ', explain: '200 : 50 = 4 (giờ).' },
          { q: 'Quãng đường 36 km, vận tốc 24 km/giờ. Đi hết bao nhiêu giờ?', answer: '1,5', unit: 'giờ', explain: '36 : 24 = 1,5 (giờ).' },
        ],
      },
    ],
  },
];

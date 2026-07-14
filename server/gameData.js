const questions = [
  {
    id: 1,
    question: "Thuật ngữ 'Kinh tế chính trị' lần đầu tiên xuất hiện trong tác phẩm nào?",
    options: [
      "A. An Inquiry into the Nature and Causes of the Wealth of Nations (Adam Smith)",
      "B. Traicté de l’oeconomie politique (Antoine de Montchrétien)",
      "C. Principles of Political Economy and Taxation (David Ricardo)",
      "D. Bộ Tư bản (C. Mác)"
    ],
    correctLetter: "B",
    correctIndex: 1
  },
  {
    id: 2,
    question: "Phương pháp nghiên cứu được coi là phương pháp chủ yếu của kinh tế chính trị Mác – Lênin là:",
    options: [
      "A. Phương pháp thống kê và mô hình hóa toán học.",
      "B. Phương pháp diễn dịch và quy nạp.",
      "C. Phương pháp trừu tượng hóa khoa học.",
      "D. Phương pháp lôgíc kết hợp với lịch sử."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 3,
    question: "Theo giáo trình, đối tượng nghiên cứu của kinh tế chính trị Mác – Lênin là:",
    options: [
      "A. Quá trình sản xuất và lưu thông tư liệu sinh hoạt.",
      "B. Các hiện tượng kinh tế và hành vi người tiêu dùng.",
      "C. Các quan hệ xã hội của sản xuất và trao đổi trong mối liên hệ với lực lượng sản xuất và kiến trúc thượng tầng.",
      "D. Sự phát triển của công cụ lao động qua các thời kỳ."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 4,
    question: "Mục đích nghiên cứu cao nhất của kinh tế chính trị Mác – Lênin là:",
    options: [
      "A. Làm giàu cho các quốc gia.",
      "B. Nâng cao hiệu quả quản trị doanh nghiệp.",
      "C. Phát hiện các quy luật chi phối quan hệ giữa người với người trong sản xuất và trao đổi.",
      "D. Dự báo chính xác khủng hoảng kinh tế."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 5,
    question: "Tại sao hàng hóa có hai thuộc tính là giá trị sử dụng và giá trị?",
    options: [
      "A. Vì hàng hóa được sản xuất để trao đổi.",
      "B. Vì người sản xuất và người tiêu dùng có lợi ích khác nhau.",
      "C. Vì lao động sản xuất hàng hóa có tính hai mặt.",
      "D. Vì có phân công lao động xã hội."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 6,
    question: "Điều kiện đủ để sản xuất hàng hóa ra đời và phát triển là:",
    options: [
      "A. Có tiền tệ.",
      "B. Có phân công lao động xã hội.",
      "C. Có sự tách biệt kinh tế giữa các chủ thể sản xuất.",
      "D. Nhu cầu tiêu dùng tăng cao."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 7,
    question: "Khi năng suất lao động tăng thì lượng giá trị của một đơn vị hàng hóa sẽ:",
    options: [
      "A. Tăng.",
      "B. Giảm.",
      "C. Không đổi.",
      "D. Tăng rồi giảm."
    ],
    correctLetter: "B",
    correctIndex: 1
  },
  {
    id: 8,
    question: "Giá trị trao đổi của hàng hóa là:",
    options: [
      "A. Lao động xã hội kết tinh trong hàng hóa.",
      "B. Công dụng của hàng hóa.",
      "C. Hình thức biểu hiện ra bên ngoài của giá trị.",
      "D. Giá bán trên thị trường."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 9,
    question: "Trong các chức năng của tiền tệ, chức năng nào đòi hỏi tiền phải có đủ giá trị?",
    options: [
      "A. Thước đo giá trị và phương tiện lưu thông.",
      "B. Phương tiện lưu thông và thanh toán.",
      "C. Phương tiện cất trữ và tiền tệ thế giới.",
      "D. Thước đo giá trị và thanh toán."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 10,
    question: "Điểm khác biệt cốt lõi giữa công thức H – T – H và T – H – T' là:",
    options: [
      "A. Trình tự lưu thông.",
      "B. Có sự xuất hiện của tiền.",
      "C. Mục đích của quá trình lưu thông.",
      "D. Hình thái vật ngang giá."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 11,
    question: "Sức lao động là hàng hóa đặc biệt vì:",
    options: [
      "A. Có thể mua mọi hàng hóa khác.",
      "B. Giá trị không do lao động quyết định.",
      "C. Khi sử dụng tạo ra giá trị lớn hơn giá trị bản thân nó.",
      "D. Chỉ tồn tại trong sản xuất hàng hóa giản đơn."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 12,
    question: "Tư bản khả biến (v) là bộ phận tư bản:",
    options: [
      "A. Giá trị chuyển nguyên vẹn vào sản phẩm.",
      "B. Tồn tại dưới dạng máy móc.",
      "C. Giá trị tăng lên trong quá trình sản xuất.",
      "D. Không thay đổi giá trị."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 13,
    question: "Tư bản bất biến (c) là bộ phận tư bản:",
    options: [
      "A. Có giá trị tăng lên sau sản xuất.",
      "B. Giá trị được bảo tồn và chuyển nguyên vẹn vào sản phẩm.",
      "C. Dùng để mua sức lao động.",
      "D. Luôn biến đổi về lượng."
    ],
    correctLetter: "B",
    correctIndex: 1
  },
  {
    id: 14,
    question: "Phương pháp sản xuất giá trị thặng dư tương đối dựa trên:",
    options: [
      "A. Kéo dài ngày lao động.",
      "B. Rút ngắn thời gian lao động tất yếu bằng tăng năng suất lao động.",
      "C. Tăng cường độ lao động.",
      "D. Mua nguyên liệu rẻ hơn."
    ],
    correctLetter: "B",
    correctIndex: 1
  },
  {
    id: 15,
    question: "Nguồn gốc thực sự của tích lũy tư bản là:",
    options: [
      "A. Tiết kiệm của nhà tư bản.",
      "B. Mua rẻ bán đắt.",
      "C. Giá trị thặng dư do công nhân tạo ra.",
      "D. Máy móc hiện đại."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 16,
    question: "Theo Lênin, đặc điểm kinh tế của chủ nghĩa tư bản độc quyền là:",
    options: [
      "A. Xóa bỏ hoàn toàn cạnh tranh.",
      "B. Tách rời tư bản ngân hàng và công nghiệp.",
      "C. Xuất khẩu tư bản trở thành phổ biến.",
      "D. Nhà nước nắm toàn bộ nền kinh tế."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 17,
    question: "Tư bản tài chính là kết quả hợp nhất giữa:",
    options: [
      "A. Tư bản thương nghiệp và ngân hàng.",
      "B. Tư bản ngân hàng độc quyền và tư bản công nghiệp độc quyền.",
      "C. Nhà nước và doanh nghiệp.",
      "D. Quỹ đầu tư và ngân hàng."
    ],
    correctLetter: "B",
    correctIndex: 1
  },
  {
    id: 18,
    question: "Hình thức độc quyền thống nhất cả sản xuất và tiêu thụ dưới một ban quản trị chung là:",
    options: [
      "A. Cartel.",
      "B. Syndicate.",
      "C. Trust.",
      "D. Consortium."
    ],
    correctLetter: "C",
    correctIndex: 2
  },
  {
    id: 19,
    question: "Bản chất của độc quyền nhà nước trong chủ nghĩa tư bản là:",
    options: [
      "A. Nhà nước phục vụ lợi ích nhân dân lao động.",
      "B. Sự kết hợp sức mạnh của các tổ chức độc quyền tư nhân với sức mạnh nhà nước.",
      "C. Nhà nước quốc hữu hóa toàn bộ doanh nghiệp.",
      "D. Nhà nước xóa bỏ cạnh tranh."
    ],
    correctLetter: "B",
    correctIndex: 1
  },
  {
    id: 20,
    question: "Tác động tiêu cực của độc quyền làm xói mòn giá trị đạo đức xã hội là:",
    options: [
      "A. Áp đặt giá bán cao.",
      "B. Kìm hãm tiến bộ kỹ thuật.",
      "C. Chi phối các quan hệ chính trị nhằm phục vụ lợi ích nhóm.",
      "D. Tạo cung cầu giả tạo."
    ],
    correctLetter: "C",
    correctIndex: 2
  }
];
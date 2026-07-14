module.exports.QUESTIONS = [
  { id: 'q1', text: '5 + 7 * 2 bằng bao nhiêu?', options: ['19', '24', '12', '17'], correctIdx: 0 },
  { id: 'q2', text: 'Thủ đô của Úc là gì?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctIdx: 2 },
  { id: 'q3', text: 'Hành tinh nào gần Mặt Trời nhất?', options: ['Sao Kim', 'Sao Hỏa', 'Sao Thủy', 'Sao Mộc'], correctIdx: 2 },
  { id: 'q4', text: 'Ngôn ngữ nào chạy chính trên trình duyệt?', options: ['Python', 'Java', 'C++', 'JavaScript'], correctIdx: 3 },
  { id: 'q5', text: 'Con số nào không phải số nguyên tố?', options: ['2', '3', '9', '11'], correctIdx: 2 }
];

module.exports.AUCTION_ITEMS = [
  { id: 'item1', secretName: 'Hộp bí mật Hoàng Gia', realName: 'Vé Du Lịch', emoji: '👑', desc: 'Chuyến du lịch nghỉ dưỡng 5 sao.', basePrice: 10 },
  { id: 'item2', secretName: 'Rương bí mật Đại Dương', realName: 'Mô hình Tàu Ngầm', emoji: '🌊', desc: 'Mô hình tàu ngầm mạ vàng nguyên khối.', basePrice: 10 },
  { id: 'item3', secretName: 'Báu vật Ánh Trăng', realName: 'Đồng hồ Đeo Tay', emoji: '🌙', desc: 'Đồng hồ phiên bản giới hạn phát sáng.', basePrice: 10 }
];

module.exports.generateGifts = () => {
  const types = [
    { type: 'add', val: 50 },
    { type: 'add', val: 100 },
    { type: 'sub', val: 20 },
    { type: 'mul', val: 2 }
  ];
  const selected = [];
  for(let i=0; i<3; i++) {
    selected.push(types[Math.floor(Math.random() * types.length)]);
  }
  return selected;
};
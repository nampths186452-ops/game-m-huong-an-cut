const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // Đã thêm thư viện tìm đường

// Import dữ liệu từ kho
const { QUESTIONS, AUCTION_ITEMS } = require('./gameData');
const { rooms, players, createRoom, getRoomSafe } = require('./gameStore');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Hàm gửi dữ liệu phòng mới nhất cho tất cả người chơi
const broadcastRoom = (roomId) => {
  const roomData = getRoomSafe(roomId);
  if (roomData) {
    io.to(roomId).emit('updateState', roomData);
  }
};

io.on('connection', (socket) => {
  console.log('Người chơi kết nối:', socket.id);

  // Kiểm tra quyền Chủ phòng
  const adminOnly = (roomId, token, callback) => {
    const p = players.get(token);
    if (p && p.isAdmin && p.roomId === roomId) {
      callback();
    } else {
      socket.emit('error', 'Bạn không có quyền quản trị!');
    }
  };

  // --- QUẢN LÝ PHÒNG ---
  socket.on('createRoom', ({ roomId, token, pin, username }) => {
    let room = rooms.get(roomId);
    if (!room) {
      room = createRoom(roomId, token, pin, username);
    }
    const p = players.get(token);
    if (p) {
      p.socketId = socket.id;
      p.online = true;
    }
    socket.join(roomId);
    broadcastRoom(roomId);
  });

  socket.on('joinRoom', ({ roomId, token, pin, username }) => {
    const room = rooms.get(roomId);
    if (!room || room.pin !== pin) {
      return socket.emit('error', 'Phòng không tồn tại hoặc sai PIN!');
    }
    
    if (!players.has(token)) {
      players.set(token, {
        token: token,
        roomId: roomId,
        username: username,
        isAdmin: false,
        socketId: socket.id,
        online: true,
        balance: 0,
        answers: {},
        openedGifts: {},
        teamId: null,
        hasAnswered: false
      });
      room.players.add(token);
    } else {
      const p = players.get(token);
      p.socketId = socket.id;
      p.online = true;
    }
    
    socket.join(roomId);
    broadcastRoom(roomId);
  });

  // --- LOGIC TRẢ LỜI CÂU HỎI ---
  socket.on('startQuiz', ({ roomId, token }) => {
    adminOnly(roomId, token, () => {
      const room = rooms.get(roomId);
      if (room) {
        room.phase = 'QUIZ';
        room.quiz.currentQuestionIndex = 0;
        const currentQuestion = QUESTIONS[0];
        if (currentQuestion) io.to(roomId).emit('newQuestion', currentQuestion);
        broadcastRoom(roomId);
      }
    });
  });

  socket.on('nextQuestion', ({ roomId, token }) => {
    adminOnly(roomId, token, () => {
      const room = rooms.get(roomId);
      if (room) {
        room.quiz.currentQuestionIndex++;
        const currentQuestion = QUESTIONS[room.quiz.currentQuestionIndex];
        
        if (currentQuestion) {
          room.quiz.readyPlayers.clear(); 
          room.players.forEach(playerToken => {
             const p = players.get(playerToken);
             if (p) p.hasAnswered = false; // Mở khoá nút bấm
          });
          io.to(roomId).emit('newQuestion', currentQuestion);
        } else {
          room.phase = 'AUCTION'; // Hết câu hỏi thì sang Đấu giá
          io.to(roomId).emit('quizFinished');
        }
        broadcastRoom(roomId);
      }
    });
  });

  socket.on('submitAnswer', ({ roomId, token, answerIndex }) => {
    const room = rooms.get(roomId);
    const player = players.get(token);
    
    if (room && player && room.phase === 'QUIZ') {
      if (player.hasAnswered) return; // Chống bấm 2 lần
      player.hasAnswered = true;
      
      const currentQuestion = QUESTIONS[room.quiz.currentQuestionIndex];
      if (currentQuestion) {
        player.answers[room.quiz.currentQuestionIndex] = answerIndex;
        
        // Kiểm tra đúng sai và cộng tiền (Mỗi câu đúng +100$)
        const isCorrect = (answerIndex === currentQuestion.correctIndex);
        if (isCorrect) {
          player.balance += 100; 
        }
      }
      
      room.quiz.readyPlayers.add(token);
      broadcastRoom(roomId);
    }
  });

  // --- LOGIC ĐẤU GIÁ ---
  socket.on('startAuctionItem', ({ roomId, token }) => {
    adminOnly(roomId, token, () => {
      const room = rooms.get(roomId);
      if (room && room.phase === 'AUCTION') {
        room.auction.status = 'OPEN';
        room.auction.currentPrice = 0;
        room.auction.leadingBidderToken = null;
        broadcastRoom(roomId);
      }
    });
  });

  socket.on('placeBid', ({ roomId, token, bidAmount }) => {
    const room = rooms.get(roomId);
    const player = players.get(token);
    
    if (room && player && room.phase === 'AUCTION' && room.auction.status === 'OPEN') {
      // Lấy giá khởi điểm hoặc giá tiếp theo
      const basePrice = AUCTION_ITEMS[room.auction.currentItemIndex]?.basePrice || 50;
      const nextPrice = room.auction.currentPrice === 0 ? basePrice : room.auction.currentPrice + 50;
      
      // Kiểm tra người chơi có đủ tiền và ra giá hợp lệ không
      if (bidAmount >= nextPrice && player.balance >= bidAmount) {
        room.auction.currentPrice = bidAmount;
        room.auction.leadingBidderToken = token;
        broadcastRoom(roomId);
      }
    }
  });

  socket.on('sellItem', ({ roomId, token }) => {
    adminOnly(roomId, token, () => {
      const room = rooms.get(roomId);
      if (room && room.phase === 'AUCTION') {
        const winnerToken = room.auction.leadingBidderToken;
        if (winnerToken) {
          const winner = players.get(winnerToken);
          if (winner) {
            winner.balance -= room.auction.currentPrice; // Trừ tiền người thắng
            room.results.push({
              item: AUCTION_ITEMS[room.auction.currentItemIndex],
              winner: winner.username,
              price: room.auction.currentPrice
            });
          }
        }
        
        // Chuyển sang đồ tiếp theo
        room.auction.status = 'WAITING';
        room.auction.currentItemIndex++;
        
        if (room.auction.currentItemIndex >= AUCTION_ITEMS.length) {
          room.phase = 'FINISHED'; // Hết đồ thì kết thúc game
        }
        broadcastRoom(roomId);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Ngắt kết nối:', socket.id);
  });
});

// --- CHẠY MÁY CHỦ ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Máy chủ đang chạy mượt mà trên cổng ${PORT}`);
});
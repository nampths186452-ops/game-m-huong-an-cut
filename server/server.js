const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

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
      const p =
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { rooms, players, createRoom, getRoomSafe } = require('./gameStore');
const { QUESTIONS, AUCTION_ITEMS, generateGifts } = require('./gameData');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../client/dist')));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "*", methods: ["GET", "POST"] }
});

app.get('/health', (req, res) => res.send('OK'));

const MIN_PLAYERS = parseInt(process.env.MIN_PLAYERS || '2');

// Helpers
const broadcastRoom = (roomId) => {
  io.to(roomId).emit('game:snapshot', getRoomSafe(roomId));
};

const getTeamBalance = (room, teamId) => {
  const team = room.teams.get(teamId);
  if(!team) return 0;
  return Array.from(team.members).reduce((sum, token) => sum + (players.get(token)?.balance || 0), 0);
};

io.on('connection', (socket) => {
  socket.on('session:resume', (token, cb) => {
    const player = players.get(token);
    if (player) {
      player.socketId = socket.id;
      player.online = true;
      socket.join(player.roomId);
      broadcastRoom(player.roomId);
      cb({ ok: true, data: { roomId: player.roomId, token } });
    } else {
      cb({ ok: false });
    }
  });

  socket.on('room:create', ({ adminName, pin }, cb) => {
    if (!adminName || adminName.trim().length < 2) return cb({ ok: false, error: 'Tên không hợp lệ' });
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = uuidv4();
    createRoom(roomId, token, pin, adminName);
    const p = players.get(token);
    p.socketId = socket.id;
    p.online = true;
    socket.join(roomId);
    cb({ ok: true, data: { roomId, token } });
    broadcastRoom(roomId);
  });

  socket.on('room:join', ({ roomId, username }, cb) => {
    const room = rooms.get(roomId);
    if (!room) return cb({ ok: false, error: 'Phòng không tồn tại' });
    if (room.phase !== 'LOBBY') return cb({ ok: false, error: 'Game đã bắt đầu' });
    if (room.players.size >= 20) return cb({ ok: false, error: 'Phòng đã đầy' });
    
    const uname = username.trim();
    if (uname.length < 2 || uname.length > 20) return cb({ ok: false, error: 'Tên 2-20 ký tự' });
    
    for (let t of room.players) {
      if (players.get(t).username.toLowerCase() === uname.toLowerCase()) {
        return cb({ ok: false, error: 'Tên đã tồn tại trong phòng' });
      }
    }

    const token = uuidv4();
    room.players.add(token);
    players.set(token, {
      token, roomId, username: uname, isAdmin: false, socketId: socket.id,
      online: true, balance: 0, answers: {}, openedGifts: {}, teamId: null
    });
    
    socket.join(roomId);
    cb({ ok: true, data: { roomId, token } });
    broadcastRoom(roomId);
  });

  // --- Admin Controls ---
  const adminOnly = (roomId, token, fn) => {
    const room = rooms.get(roomId);
    if (!room || room.adminToken !== token) return;
    fn(room);
    broadcastRoom(roomId);
  };

  socket.on('admin:startQuiz', ({ roomId, token }, cb) => {
    adminOnly(roomId, token, (room) => {
      if (room.players.size < MIN_PLAYERS) return cb({ ok: false, error: `Cần ít nhất ${MIN_PLAYERS} người` });
      room.phase = 'QUIZ';
      io.to(roomId).emit('quiz:question', { qIndex: 0, question: { id: QUESTIONS[0].id, text: QUESTIONS[0].text, options: QUESTIONS[0].options } });
      cb({ ok: true });
    });
  });

  socket.on('admin:nextPhase', ({ roomId, token, phase }, cb) => {
    adminOnly(roomId, token, (room) => {
      room.phase = phase;
      cb({ ok: true });
    });
  });

  // --- Quiz & Gifts ---
  socket.on('quiz:answer', ({ token, qIndex, answerIdx }, cb) => {
    const p = players.get(token);
    if(!p) return;
    const room = rooms.get(p.roomId);
    if(!room || room.phase !== 'QUIZ' || room.quiz.currentQuestionIndex !== qIndex) return cb({ok:false});
    if(p.answers[qIndex] !== undefined) return cb({ok:false, error: 'Đã trả lời'});
    
    const correct = QUESTIONS[qIndex].correctIdx === answerIdx;
    p.answers[qIndex] = correct;
    
    // Tạo 3 phần thưởng cho client chọn
    const gifts = generateGifts();
    cb({ ok: true, data: { correct, giftsOptions: gifts } });
  });

  socket.on('gift:open', ({ token, qIndex, selectedGift }, cb) => {
    const p = players.get(token);
    if(!p) return;
    const room = rooms.get(p.roomId);
    if(!room || p.openedGifts[qIndex]) return cb({ok:false});
    
    let oldBal = p.balance;
    if(selectedGift.type === 'add') p.balance += selectedGift.val;
    if(selectedGift.type === 'sub') p.balance = Math.max(0, p.balance - selectedGift.val);
    if(selectedGift.type === 'mul') {
      if(p.balance > 0) p.balance = Math.floor(p.balance * selectedGift.val);
    }
    
    p.openedGifts[qIndex] = true;
    cb({ ok: true, data: { oldBalance: oldBal, newBalance: p.balance, gift: selectedGift } });
    broadcastRoom(p.roomId);
  });

  socket.on('quiz:readyNext', ({ token, qIndex }) => {
    const p = players.get(token);
    if(!p) return;
    const room = rooms.get(p.roomId);
    if(room && room.quiz.currentQuestionIndex === qIndex) {
      room.quiz.readyPlayers.add(token);
      broadcastRoom(p.roomId);
      // Auto next if all ready
      if(room.quiz.readyPlayers.size >= room.players.size) {
        room.quiz.currentQuestionIndex++;
        room.quiz.readyPlayers.clear();
        if(room.quiz.currentQuestionIndex >= QUESTIONS.length) {
          room.phase = 'LEADERBOARD';
        } else {
          const q = QUESTIONS[room.quiz.currentQuestionIndex];
          io.to(p.roomId).emit('quiz:question', { qIndex: room.quiz.currentQuestionIndex, question: { id: q.id, text: q.text, options: q.options } });
        }
        broadcastRoom(p.roomId);
      }
    }
  });

  // --- Teams ---
  socket.on('team:create', ({ token, teamName }, cb) => {
    const p = players.get(token);
    if(!p) return;
    const room = rooms.get(p.roomId);
    if(room.phase !== 'TEAM_SETUP') return cb({ok:false});
    
    const tName = teamName.trim();
    if(tName.length < 2 || tName.length > 24) return cb({ok:false, error:'Tên đội 2-24 ký tự'});
    for(let t of room.teams.values()) {
      if(t.name.toLowerCase() === tName.toLowerCase()) return cb({ok:false, error:'Tên đội đã tồn tại'});
    }
    
    const teamId = uuidv4();
    room.teams.set(teamId, { id: teamId, name: tName, leaderToken: token, members: new Set([token]) });
    p.teamId = teamId;
    cb({ok:true});
    broadcastRoom(p.roomId);
  });

  socket.on('team:join', ({ token, teamId }, cb) => {
    const p = players.get(token);
    if(!p) return;
    const room = rooms.get(p.roomId);
    const team = room.teams.get(teamId);
    if(!team || team.members.size >= 4) return cb({ok:false, error:'Đội đầy hoặc không tồn tại'});
    team.members.add(token);
    p.teamId = teamId;
    cb({ok:true});
    broadcastRoom(p.roomId);
  });

  // --- Auction ---
  socket.on('admin:startAuction', ({ roomId, token }, cb) => {
    adminOnly(roomId, token, (room) => {
      room.phase = 'AUCTION';
      room.auction.status = 'OPEN';
      cb({ ok: true });
    });
  });

  // Chống spam bid (rate limit đơn giản)
  const lastBidTimes = new Map();

  socket.on('auction:bid', ({ token }, cb) => {
    const p = players.get(token);
    if(!p) return cb({ok:false, error:'Player not found'});
    const room = rooms.get(p.roomId);
    if(!room || room.phase !== 'AUCTION' || room.auction.status !== 'OPEN') return cb({ok:false, error:'Phiên đấu chưa mở'});
    
    const now = Date.now();
    if(lastBidTimes.has(token) && now - lastBidTimes.get(token) < 200) return cb({ok:false, error:'Spam bid'});
    lastBidTimes.set(token, now);

    const isTeam = !!p.teamId;
    const nextPrice = room.auction.currentPrice === 0 ? AUCTION_ITEMS[room.auction.currentItemIndex].basePrice : room.auction.currentPrice + 50;
    const availableBalance = isTeam ? getTeamBalance(room, p.teamId) : p.balance;
    
    if (availableBalance < nextPrice) return cb({ok:false, error:'Không đủ tiền'});
    
    // Check nếu đội vừa tự bid
    if (room.auction.leadingBidderToken) {
       const leader = players.get(room.auction.leadingBidderToken);
       if(leader && isTeam && leader.teamId === p.teamId) return cb({ok:false, error:'Đội của bạn đang dẫn đầu'});
       if(leader && !isTeam && leader.token === p.token) return cb({ok:false, error:'Bạn đang dẫn đầu'});
    }

    // Atomic update
    room.auction.currentPrice = nextPrice;
    room.auction.leadingBidderToken = token;
    room.auction.leadingBidderIsTeam = isTeam;
    
    if (room.auction.timer) clearTimeout(room.auction.timer);
    room.auction.timer = setTimeout(() => closeAuction(room), 10000);
    
    io.to(p.roomId).emit('auction:bidAccepted', { price: nextPrice, bidderName: getBidderName(token, isTeam) });
    broadcastRoom(p.roomId);
    cb({ok:true});
  });

  socket.on('admin:closeAuction', ({ roomId, token }, cb) => {
    adminOnly(roomId, token, (room) => {
      if(room.auction.timer) clearTimeout(room.auction.timer);
      closeAuction(room);
      cb({ok:true});
    });
  });

  socket.on('admin:nextItem', ({ roomId, token }, cb) => {
    adminOnly(roomId, token, (room) => {
      if (room.auction.currentItemIndex < 2) {
        room.auction.currentItemIndex++;
        room.auction.currentPrice = 0;
        room.auction.status = 'OPEN';
        room.auction.leadingBidderToken = null;
        room.auction.leadingBidderIsTeam = false;
        cb({ok:true});
      } else {
        room.phase = 'FINISHED';
        cb({ok:true});
      }
    });
  });

  const closeAuction = (room) => {
    if(room.auction.status !== 'OPEN') return;
    room.auction.status = 'CLOSED';
    
    const cost = room.auction.currentPrice;
    const winnerToken = room.auction.leadingBidderToken;
    const winner = players.get(winnerToken);
    
    if(winner && cost > 0) {
      if(winner.teamId) {
        const team = room.teams.get(winner.teamId);
        let remaining = cost;
        const members = Array.from(team.members).map(t => players.get(t)).sort((a,b) => b.balance - a.balance);
        for(let m of members) {
          if(remaining <= 0) break;
          const deduct = Math.min(m.balance, remaining);
          m.balance -= deduct;
          remaining -= deduct;
        }
      } else {
        winner.balance -= cost;
      }
      
      room.results.push({
        itemIndex: room.auction.currentItemIndex,
        item: AUCTION_ITEMS[room.auction.currentItemIndex],
        price: cost,
        winnerName: getBidderName(winnerToken, !!winner.teamId)
      });
    }
    
    io.to(room.id).emit('auction:closed', { item: AUCTION_ITEMS[room.auction.currentItemIndex], results: room.results });
    broadcastRoom(room.id);
  };

  socket.on('disconnect', () => {
    for (let [token, p] of players.entries()) {
      if (p.socketId === socket.id) {
        p.online = false;
        p.socketId = null;
        broadcastRoom(p.roomId);
        break;
      }
    }
  });
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
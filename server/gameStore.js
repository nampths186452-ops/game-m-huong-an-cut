const { QUESTIONS, AUCTION_ITEMS } = require('./gameData');

// Lưu trữ toàn bộ trên RAM
const rooms = new Map();
const players = new Map(); // token -> player

const createRoom = (roomId, adminToken, pin, adminName) => {
  const room = {
    id: roomId,
    pin: pin,
    adminToken: adminToken,
    phase: 'LOBBY', // LOBBY, QUIZ, LEADERBOARD, TEAM_SETUP, AUCTION, FINISHED
    players: new Set([adminToken]),
    teams: new Map(), // teamId -> { id, name, leaderToken, members: Set() }
    quiz: { currentQuestionIndex: 0, readyPlayers: new Set() },
    auction: { 
      currentItemIndex: 0, 
      currentPrice: 0, 
      status: 'WAITING', // WAITING, OPEN, CLOSED
      leadingBidderToken: null,
      leadingBidderIsTeam: false,
      timer: null 
    },
    results: []
  };
  rooms.set(roomId, room);
  
  players.set(adminToken, {
    token: adminToken,
    roomId: roomId,
    username: adminName.trim(),
    isAdmin: true,
    socketId: null,
    online: false,
    balance: 0,
    answers: {},
    openedGifts: {}, // qIndex -> gift
    teamId: null
  });
  return room;
};

const getRoomSafe = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  const roomPlayers = Array.from(room.players).map(t => players.get(t)).filter(Boolean);
  const teamsData = Array.from(room.teams.values()).map(t => ({
    id: t.id,
    name: t.name,
    leaderToken: t.leaderToken,
    members: Array.from(t.members).map(mt => {
      const p = players.get(mt);
      return p ? { username: p.username, balance: p.balance } : null;
    }).filter(Boolean)
  }));

  return {
    id: room.id,
    phase: room.phase,
    adminToken: room.adminToken,
    players: roomPlayers.map(p => ({
      username: p.username,
      isAdmin: p.isAdmin,
      online: p.online,
      balance: p.balance,
      teamId: p.teamId,
      token: p.token // Gửi token để nhận diện chính mình, client tự filter
    })),
    teams: teamsData,
    quiz: {
      currentQuestionIndex: room.quiz.currentQuestionIndex,
      readyCount: room.quiz.readyPlayers.size,
      totalCount: room.players.size
    },
    auction: {
      currentItemIndex: room.auction.currentItemIndex,
      currentPrice: room.auction.currentPrice,
      status: room.auction.status,
      leadingBidderName: getBidderName(room.auction.leadingBidderToken, room.auction.leadingBidderIsTeam),
      nextPrice: room.auction.currentPrice === 0 ? AUCTION_ITEMS[room.auction.currentItemIndex]?.basePrice : room.auction.currentPrice + 50
    },
    results: room.results
  };
};

function getBidderName(token, isTeam) {
  if (!token) return null;
  const p = players.get(token);
  if (!p) return null;
  if (isTeam && p.teamId) {
    const room = rooms.get(p.roomId);
    const team = room.teams.get(p.teamId);
    return team ? team.name : p.username;
  }
  return p.username;
}

module.exports = { rooms, players, createRoom, getRoomSafe };
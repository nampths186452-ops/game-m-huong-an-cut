import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import Quiz from './components/Quiz';
import TeamSetup from './components/TeamSetup';
import Auction from './components/Auction';
import Results from './components/Results';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [myToken, setMyToken] = useState(localStorage.getItem('game_token') || null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    if (myToken) {
      socket.emit('session:resume', myToken, (res) => {
        if (!res.ok) {
          localStorage.removeItem('game_token');
          setMyToken(null);
        }
      });
    }

    socket.on('game:snapshot', (state) => setGameState(state));
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('game:snapshot');
    };
  }, [myToken]);

  const saveAuth = (token) => {
    localStorage.setItem('game_token', token);
    setMyToken(token);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    socket.emit('room:create', { adminName: fd.get('name'), pin: fd.get('pin') }, (res) => {
      if(res.ok) saveAuth(res.data.token);
      else setError(res.error);
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    socket.emit('room:join', { roomId: fd.get('roomId').toUpperCase(), username: fd.get('name') }, (res) => {
      if(res.ok) saveAuth(res.data.token);
      else setError(res.error);
    });
  };

  if (!myToken || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card w-full max-w-md">
          <h1 className="text-3xl font-serif text-gold text-center mb-6">Đấu Giá Chớp Nhoáng</h1>
          {!isConnected && <p className="text-red-400 text-center mb-4">Đang kết nối server...</p>}
          {error && <p className="bg-red-900 text-white p-2 rounded mb-4">{error}</p>}
          
          <form onSubmit={handleJoinRoom} className="space-y-4 mb-8">
            <h2 className="text-xl font-bold">Tham gia phòng</h2>
            <input name="roomId" placeholder="Mã phòng (VD: ABCD12)" required className="w-full p-2 rounded text-navy" />
            <input name="name" placeholder="Tên hiển thị" required className="w-full p-2 rounded text-navy" />
            <button type="submit" className="w-full btn-gold" disabled={!isConnected}>VÀO CHƠI</button>
          </form>
          
          <hr className="border-white/20 mb-8" />
          
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <h2 className="text-xl font-bold">Tạo phòng mới (Admin)</h2>
            <input name="name" placeholder="Tên Admin" required className="w-full p-2 rounded text-navy" />
            <input name="pin" type="password" placeholder="Mã PIN 4-6 số" required className="w-full p-2 rounded text-navy" />
            <button type="submit" className="w-full btn-maroon" disabled={!isConnected}>TẠO PHÒNG</button>
          </form>
        </div>
      </div>
    );
  }

  const me = gameState.players.find(p => p.token === myToken);
  const isAdmin = myToken === gameState.adminToken;

  const phaseComponents = {
    LOBBY: <Lobby state={gameState} isAdmin={isAdmin} token={myToken} />,
    QUIZ: <Quiz state={gameState} token={myToken} me={me} />,
    LEADERBOARD: <TeamSetup state={gameState} token={myToken} isAdmin={isAdmin} me={me} />,
    TEAM_SETUP: <TeamSetup state={gameState} token={myToken} isAdmin={isAdmin} me={me} />,
    AUCTION: <Auction state={gameState} token={myToken} isAdmin={isAdmin} me={me} />,
    FINISHED: <Results state={gameState} isAdmin={isAdmin} token={myToken} />
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy/80 backdrop-blur border-b border-white/10 p-4 sticky top-0 z-50 flex justify-between items-center">
        <div>
          <span className="font-serif text-gold text-lg">Phòng: {gameState.id}</span>
        </div>
        <div className="text-right">
          <div className="font-bold">{me?.username} {isAdmin && '👑'}</div>
          <div className="text-green-400 font-bold text-xl">${me?.balance?.toLocaleString()}</div>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 max-w-4xl w-full mx-auto">
        {phaseComponents[gameState.phase]}
      </main>
    </div>
  );
}
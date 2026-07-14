import React from 'react';
import { socket } from '../socket';

export default function Lobby({ state, isAdmin, token }) {
  const startQuiz = () => {
    socket.emit('admin:startQuiz', { roomId: state.id, token }, (res) => {
      if(!res.ok) alert(res.error);
    });
  };

  // Link ảnh cung điện (mình lấy tạm một sảnh lâu đài cực đẹp từ Unsplash)
  // Bạn có thể thay link này bằng ảnh bất kỳ mà bạn thích!
  const palaceBg = "https://images.unsplash.com/photo-1548625361-ec853c06e23b?q=80&w=2070&auto=format&fit=crop";

  return (
    <div 
      className="card space-y-6 text-center mt-10 relative overflow-hidden border border-gold-dark/30 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 15, 24, 0.8), rgba(10, 15, 24, 0.95)), url(${palaceBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h2 className="text-4xl font-serif text-gold-gradient uppercase tracking-widest mb-2">Sảnh Chờ Hoàng Gia</h2>
      
      <p className="text-xl text-gray-300">
        Mã phòng: <span className="font-bold text-3xl tracking-widest text-white bg-blue-900/40 px-4 py-1 rounded border border-blue-500/30">{state.id}</span>
      </p>
      
      <div className="bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-gold/20 shadow-inner my-6">
        <h3 className="mb-4 text-gold-light text-lg uppercase tracking-wide">Khách Mời ({state.players.length}/20)</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {state.players.map((p, i) => (
            <span key={i} className={`px-4 py-2 rounded-full font-bold shadow-md border ${p.online ? 'bg-gradient-to-r from-green-900 to-emerald-900 text-green-100 border-green-500/50' : 'bg-gray-800 text-gray-400 border-gray-600'}`}>
              {p.username} {p.isAdmin && ' 👑'}
            </span>
          ))}
        </div>
      </div>
      
      {isAdmin && (
        <button onClick={startQuiz} className="btn-gold w-full text-xl py-4 mt-4 shadow-lg">BẮT ĐẦU GAME</button>
      )}
      {!isAdmin && (
        <p className="animate-pulse text-gold-light/70 text-lg font-serif tracking-wider">Đang chờ Chủ phòng mở cửa...</p>
      )}
    </div>
  );
}
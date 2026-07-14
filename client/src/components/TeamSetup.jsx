import React, { useState } from 'react';
import { socket } from '../socket';

export default function TeamSetup({ state, token, isAdmin, me }) {
  const [teamName, setTeamName] = useState('');

  const createTeam = (e) => {
    e.preventDefault();
    socket.emit('team:create', { token, teamName }, res => {
      if(!res.ok) alert(res.error);
    });
  };

  const joinTeam = (teamId) => {
    socket.emit('team:join', { token, teamId }, res => {
      if(!res.ok) alert(res.error);
    });
  };

  const goAuction = () => {
    socket.emit('admin:startAuction', { roomId: state.id, token });
  };

  const sortedPlayers = [...state.players].sort((a,b) => b.balance - a.balance);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif text-gold text-center">Bảng Xếp Hạng & Ghép Đội</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card overflow-y-auto max-h-96">
          <h3 className="font-bold text-xl mb-4 border-b border-white/20 pb-2">Top Đại Gia</h3>
          {sortedPlayers.map((p, i) => (
            <div key={i} className={`flex justify-between p-2 rounded mb-1 ${p.token === token ? 'bg-white/20 font-bold' : ''}`}>
              <span>{i+1}. {p.username}</span>
              <span className="text-green-400">${p.balance}</span>
            </div>
          ))}
        </div>

        <div className="card space-y-6">
          <h3 className="font-bold text-xl border-b border-white/20 pb-2">Danh sách đội</h3>
          {state.teams.map(t => (
            <div key={t.id} className="bg-black/30 p-3 rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-gold">{t.name}</span>
                <div className="text-sm text-gray-300">Thành viên: {t.members.map(m=>m.username).join(', ')}</div>
              </div>
              {!me.teamId && t.members.length < 4 && (
                <button onClick={() => joinTeam(t.id)} className="btn-gold text-sm py-1 px-2">Tham gia</button>
              )}
            </div>
          ))}
          
          {!me.teamId && (
             <form onSubmit={createTeam} className="flex gap-2">
               <input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="Tên đội mới" required className="flex-1 p-2 rounded text-navy" />
               <button type="submit" className="btn-maroon">Tạo đội</button>
             </form>
          )}
          {me.teamId && <p className="text-green-400 font-bold">Bạn đã có đội. Sẵn sàng đấu giá!</p>}
        </div>
      </div>
      
      {isAdmin && (
        <button onClick={goAuction} className="btn-gold w-full py-4 text-xl mt-4">CHỐT ĐỘI & BẮT ĐẦU ĐẤU GIÁ</button>
      )}
    </div>
  );
}
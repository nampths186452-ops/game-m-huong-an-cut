import React from 'react';

export default function Results({ state, isAdmin, token }) {
  const sortedPlayers = [...state.players].sort((a,b) => b.balance - a.balance);

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-serif text-gold mb-8">Kết Quả Đấu Giá</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.results.map((r, i) => (
          <div key={i} className="card text-center border-gold">
            <div className="text-6xl mb-2">{r.item.emoji}</div>
            <h3 className="text-xl font-serif font-bold text-gold">{r.item.realName}</h3>
            <p className="text-sm mt-2 text-gray-300">{r.item.desc}</p>
            <div className="mt-4 bg-black/30 p-2 rounded">
              <p>Chủ nhân: <span className="font-bold">{r.winnerName}</span></p>
              <p className="text-green-400 font-bold">${r.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card max-w-2xl mx-auto">
        <h3 className="text-2xl font-serif mb-4 text-center">Tài sản còn lại</h3>
        <div className="space-y-2">
          {sortedPlayers.map((p, i) => (
            <div key={i} className="flex justify-between p-3 bg-black/20 rounded">
              <span className="font-bold">{i+1}. {p.username} {p.teamId ? '(Đội)' : ''}</span>
              <span className="text-green-400 font-bold">${p.balance}</span>
            </div>
          ))}
        </div>
      </div>
      
      {isAdmin && (
        <div className="text-center mt-10">
          <p className="text-gray-400 mb-2">Chức năng chơi lại đang trong quá trình phát triển (reset server để chơi lại).</p>
        </div>
      )}
    </div>
  );
}
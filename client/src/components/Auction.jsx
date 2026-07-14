import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';

export default function Auction({ state, token, isAdmin, me }) {
  const [flash, setFlash] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const auction = state.auction;
  const isClosed = auction.status === 'CLOSED';
  const lastPriceRef = useRef(auction.currentPrice);

  useEffect(() => {
    if(auction.currentPrice > lastPriceRef.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      lastPriceRef.current = auction.currentPrice;
    }
  }, [auction.currentPrice]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.code === 'Space' && !e.repeat && !isClosed) {
        if(['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
        handleBid();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosed]);

  const handleBid = () => {
    setErrorMsg('');
    socket.emit('auction:bid', { token }, res => {
      if(!res.ok) setErrorMsg(res.error);
    });
  };

  const closeAuction = () => socket.emit('admin:closeAuction', { roomId: state.id, token });
  const nextItem = () => socket.emit('admin:nextItem', { roomId: state.id, token });

  return (
    <div className={`transition-colors duration-300 min-h-[80vh] flex flex-col ${flash ? 'flash-screen' : ''}`}>
      <div className="text-center space-y-4 flex-1">
        <h2 className="text-xl text-gray-300">Vật phẩm bí mật #{auction.currentItemIndex + 1}</h2>
        
        {isClosed && state.results[auction.currentItemIndex] ? (
           <div className="card animate-bounce scale-110">
             <div className="text-8xl mb-4">{state.results[auction.currentItemIndex].item.emoji}</div>
             <h3 className="text-3xl font-serif text-gold">{state.results[auction.currentItemIndex].item.realName}</h3>
             <p className="mt-2 text-xl">{state.results[auction.currentItemIndex].item.desc}</p>
             <hr className="my-4 border-white/20" />
             <p className="text-2xl">Người thắng: <span className="font-bold text-green-400">{state.results[auction.currentItemIndex].winnerName}</span></p>
             <p className="text-2xl">Giá chốt: <span className="font-bold">${state.results[auction.currentItemIndex].price}</span></p>
           </div>
        ) : (
           <div className="card py-12">
             <div className="text-8xl mb-6">❓</div>
             <h3 className="text-3xl font-serif text-gold">Hộp Bí Mật Đang Khóa</h3>
           </div>
        )}

        {!isClosed && (
          <div className="card mt-8 bg-black/40">
            <p className="text-lg">Giá hiện tại</p>
            <p className="text-6xl font-bold text-green-400 font-serif my-2">${auction.currentPrice}</p>
            {auction.leadingBidderName && (
              <p className="text-xl text-gold">Đang dẫn đầu: {auction.leadingBidderName}</p>
            )}
            
            <div className="mt-8">
              <button 
                onClick={handleBid} 
                className="w-full max-w-sm h-32 text-3xl font-bold rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 active:scale-95 transition-all shadow-[0_10px_0_rgb(153,27,27)] active:shadow-[0_0px_0_rgb(153,27,27)] active:translate-y-2"
              >
                ĐẤU GIÁ (${auction.nextPrice})
              </button>
              <p className="mt-4 text-gray-400">Chạm nút hoặc nhấn Spacebar</p>
              {errorMsg && <p className="text-red-400 mt-2 font-bold">{errorMsg}</p>}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card mt-6 p-4 flex gap-4">
          {!isClosed ? (
            <button onClick={closeAuction} className="btn-maroon flex-1">CHỐT GIÁ BẰNG BÚA</button>
          ) : (
            <button onClick={nextItem} className="btn-gold flex-1">VẬT PHẨM TIẾP THEO</button>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

export default function Quiz({ state, token, me }) {
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [giftsOptions, setGiftsOptions] = useState([]);
  const [giftResult, setGiftResult] = useState(null);

  useEffect(() => {
    const handleQ = (data) => {
      setQuestion(data.question);
      setAnswered(false);
      setGiftsOptions([]);
      setGiftResult(null);
    };
    socket.on('quiz:question', handleQ);
    return () => socket.off('quiz:question', handleQ);
  }, []);

  const handleAnswer = (idx) => {
    if(answered) return;
    socket.emit('quiz:answer', { token, qIndex: state.quiz.currentQuestionIndex, answerIdx: idx }, (res) => {
      if(res.ok) {
        setAnswered(true);
        setGiftsOptions(res.data.giftsOptions);
      }
    });
  };

  const handleOpenGift = (gift) => {
    socket.emit('gift:open', { token, qIndex: state.quiz.currentQuestionIndex, selectedGift: gift }, (res) => {
      if(res.ok) setGiftResult(res.data);
    });
  };

  const handleNext = () => {
    socket.emit('quiz:readyNext', { token, qIndex: state.quiz.currentQuestionIndex });
  };

  if (!question) return <div className="text-center mt-20">Đang tải câu hỏi...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Câu hỏi {state.quiz.currentQuestionIndex + 1}/5</h2>
        <span className="text-sm bg-black/30 px-3 py-1 rounded">Sẵn sàng: {state.quiz.readyCount}/{state.quiz.totalCount}</span>
      </div>

      {!answered ? (
        <div className="card">
          <h3 className="text-2xl font-serif mb-6">{question.text}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)} className="p-4 bg-navy border border-white/20 rounded hover:bg-white/10 text-left text-lg">
                {String.fromCharCode(65+i)}. {opt}
              </button>
            ))}
          </div>
        </div>
      ) : !giftResult ? (
        <div className="card text-center">
          <h3 className="text-xl mb-6">Chọn một hộp quà bí mật!</h3>
          <div className="flex justify-center gap-6">
            {giftsOptions.map((g, i) => (
              <button key={i} onClick={() => handleOpenGift(g)} className="text-6xl shake-anim hover:scale-110 transition-transform">
                🎁
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center space-y-4">
          <h3 className="text-2xl font-serif text-gold">Mở quà thành công!</h3>
          <div className="text-6xl my-4">🎉</div>
          <p className="text-xl">Phần thưởng: 
            <span className="font-bold ml-2">
              {giftResult.gift.type === 'add' ? '+' : giftResult.gift.type === 'sub' ? '-' : 'x'}{giftResult.gift.val}
            </span>
          </p>
          <p className="text-gray-300">Tiền cũ: ${giftResult.oldBalance} ➔ Tiền mới: <span className="text-green-400 font-bold">${giftResult.newBalance}</span></p>
          <button onClick={handleNext} className="btn-gold mt-6 w-full">TIẾP TỤC</button>
        </div>
      )}
    </div>
  );
}
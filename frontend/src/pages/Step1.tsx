import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Card {
  id: number;
  content: string;
  type: 'タスク' | '人物' | 'スキル' | '';
}

const Step1 = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([
    { id: 1, content: '', type: '' },
    { id: 2, content: '', type: '' },
    { id: 3, content: '', type: '' },
    { id: 4, content: '', type: '' },
    { id: 5, content: '', type: '' },
    { id: 6, content: '', type: '' },
  ]);

  const handleCardChange = (id: number, content: string) => {
    setCards(cards.map((card) => (card.id === id ? { ...card, content } : card)));
  };

  const addCard = () => {
    const newId = Math.max(...cards.map((c) => c.id)) + 1;
    setCards([...cards, { id: newId, content: '', type: '' }]);
  };

  const handleNext = () => {
    navigate('/step2');
  };

  return (
    <main className="flex-1 p-12 flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP1 ビフォースケッチ</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">1/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          まずは、あなたの現在の仕事を構成する要素を自由に書き出してみましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '14.2%' }}
          ></div>
        </div>
      </header>

      <div className="flex-1 bg-slate-100 rounded-2xl p-8 grid grid-cols-4 grid-rows-2 gap-6 relative fade-in">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-lg p-4 shadow-sm flex flex-col justify-between transition-all duration-200 hover:transform hover:-translate-y-1 hover:scale-105 hover:shadow-lg cursor-grab"
          >
            <textarea
              value={card.content}
              onChange={(e) => handleCardChange(card.id, e.target.value)}
              className="w-full h-full bg-transparent resize-none focus:outline-none"
              placeholder="タスクや人物、スキルを記入..."
            />
            <div className="text-right text-xs text-slate-400">{card.type || ''}</div>
          </div>
        ))}

        <button
          onClick={addCard}
          className="absolute top-8 right-8 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-3xl font-light shadow-lg hover:bg-orange-700 transition-transform hover:scale-110"
        >
          +
        </button>
      </div>

      <footer className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-700 transition-all"
        >
          次へ進む
        </button>
      </footer>
    </main>
  );
};

export default Step1;

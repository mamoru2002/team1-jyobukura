import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkCard {
  id: number;
  content: string;
  energyPercentage: number;
}

const Step1 = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<WorkCard[]>([]);

  useEffect(() => {
    // 保存されたカードデータを読み込み
    const savedCards = localStorage.getItem('step1-cards');
    if (savedCards) {
      setCards(JSON.parse(savedCards));
    }
  }, []);

  const getTotalEnergy = () => {
    return cards.reduce((total, card) => total + card.energyPercentage, 0);
  };

  const getRemainingEnergy = () => {
    return 100 - getTotalEnergy();
  };

  const saveCards = (newCards: WorkCard[]) => {
    localStorage.setItem('step1-cards', JSON.stringify(newCards));
  };

  const handleCardChange = (id: number, content: string) => {
    const newCards = cards.map((card) => (card.id === id ? { ...card, content } : card));
    setCards(newCards);
    saveCards(newCards);
  };

  const handleEnergyChange = (id: number, energy: number) => {
    const totalEnergy = getTotalEnergy();
    const currentCardEnergy = cards.find(card => card.id === id)?.energyPercentage || 0;
    const newTotal = totalEnergy - currentCardEnergy + energy;

    if (newTotal <= 100) {
      const newCards = cards.map((card) => (card.id === id ? { ...card, energyPercentage: energy } : card));
      setCards(newCards);
      saveCards(newCards);
    }
  };

  const addCard = () => {
    const newId = cards.length > 0 ? Math.max(...cards.map((c) => c.id)) + 1 : 1;
    const newCard: WorkCard = {
      id: newId,
      content: '',
      energyPercentage: 0
    };
    const newCards = [...cards, newCard];
    setCards(newCards);
    saveCards(newCards);
  };

  const handleNext = () => {
    // 最終保存
    saveCards(cards);
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

      {/* エネルギー使用状況表示 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">エネルギー使用状況</span>
          <span className="text-sm text-slate-600">
            使用中: {getTotalEnergy()}% / 残り: {getRemainingEnergy()}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getTotalEnergy()}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 rounded-2xl p-8">
        <div className="grid grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg p-6 shadow-sm flex flex-col space-y-4 transition-all duration-200 hover:shadow-lg"
            >
              <textarea
                value={card.content}
                onChange={(e) => handleCardChange(card.id, e.target.value)}
                className="w-full h-24 bg-transparent resize-none focus:outline-none text-sm"
                placeholder="仕事の内容を記入..."
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">エネルギー</span>
                  <span className="text-xs font-medium text-slate-800">{card.energyPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${card.energyPercentage}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={getRemainingEnergy() + card.energyPercentage}
                  value={card.energyPercentage}
                  onChange={(e) => handleEnergyChange(card.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          ))}

          {/* 常に表示されるカード追加ボタン */}
          <button
            onClick={addCard}
            className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-light mx-auto mb-2 group-hover:scale-110 transition-transform">
                +
              </div>
              <span className="text-sm text-slate-600 group-hover:text-orange-600">カードを追加</span>
            </div>
          </button>
        </div>
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

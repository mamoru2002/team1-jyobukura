import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkCard {
  id: number;
  content: string;
  energyPercentage: number;
}

const Step2 = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
  });
  const [beforeSketchItems, setBeforeSketchItems] = useState<WorkCard[]>([]);

  useEffect(() => {
    // STEP1で保存されたデータを読み込み
    const savedCards = localStorage.getItem('step1-cards');
    if (savedCards) {
      setBeforeSketchItems(JSON.parse(savedCards));
    }

    // STEP2で保存された回答を読み込み
    const savedAnswers = localStorage.getItem('step2-answers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  const handleNext = () => {
    // STEP2の回答をlocalStorageに保存
    localStorage.setItem('step2-answers', JSON.stringify(answers));
    navigate('/step3');
  };

  const handleBack = () => {
    // 現在の回答を保存してから戻る
    localStorage.setItem('step2-answers', JSON.stringify(answers));
    navigate('/step1');
  };

  const handleAnswerChange = (question: string, value: string) => {
    const newAnswers = { ...answers, [question]: value };
    setAnswers(newAnswers);
    // リアルタイムで保存
    localStorage.setItem('step2-answers', JSON.stringify(newAnswers));
  };

  return (
    <main className="flex-1 p-12 flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP2 ビフォースケッチの省察</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">2/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          書き出した仕事の要素を見ながら、自分自身に問いかけてみましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '28.4%' }}
          ></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-8 fade-in">
        <div className="bg-slate-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold mb-4">あなたのビフォースケッチ</h3>
          {beforeSketchItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <p>STEP1で入力したデータがありません</p>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto auto-rows-max">
              {beforeSketchItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm flex flex-col h-fit">
                  <div className="text-sm font-medium text-slate-800 mb-2 break-words">
                    {item.content || '（未入力）'}
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">エネルギー</span>
                      <span className="text-xs font-medium text-slate-800">{item.energyPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.energyPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-6 overflow-y-auto">
          <div>
            <label className="font-bold text-slate-700">
              いまの仕事を始めたときと比べて、現在の時間とエネルギーの割り当てに変化はありますか？
            </label>
            <textarea
              rows={4}
              value={answers.question1}
              onChange={(e) => handleAnswerChange('question1', e.target.value)}
              className="mt-2 w-full p-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
              placeholder="例：以前は顧客対応に多くの時間を使っていたが、今は資料作成が中心になっている..."
            />
          </div>
          <div>
            <label className="font-bold text-slate-700">
              現在の時間とエネルギーの割り当てを見て、どのように感じますか？その理由は？
            </label>
            <textarea
              rows={4}
              value={answers.question2}
              onChange={(e) => handleAnswerChange('question2', e.target.value)}
              className="mt-2 w-full p-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
              placeholder="例：思ったより雑務に時間を割いていて驚いた。もっと企画に時間を使いたいと感じる..."
            />
          </div>
          <div>
            <label className="font-bold text-slate-700">
              ビフォースケッチを見て、どこか驚いた点はありますか？
            </label>
            <textarea
              rows={4}
              value={answers.question3}
              onChange={(e) => handleAnswerChange('question3', e.target.value)}
              className="mt-2 w-full p-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
              placeholder="例：「あの人」との関わりが、意外と多くの業務に影響していることに気づいた..."
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-700 transition-all"
        >
          前に戻る
        </button>
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

export default Step2;

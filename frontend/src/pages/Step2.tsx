import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Step2 = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
  });

  const beforeSketchItems = [
    '定例会議の資料作成',
    'クライアントAとの打ち合わせ',
    '〇〇部長 (週1で報告)',
    'チームメンバーとの雑談',
    'Excelスキル',
    '新機能の企画',
    '問い合わせ対応',
  ];

  const handleNext = () => {
    navigate('/step3');
  };

  const handleBack = () => {
    navigate('/step1');
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
          <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
            {beforeSketchItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-6 overflow-y-auto">
          <div>
            <label className="font-bold text-slate-700">
              いまの仕事を始めたときと比べて、現在の時間とエネルギーの割り当てに変化はありますか？
            </label>
            <textarea
              rows={4}
              value={answers.question1}
              onChange={(e) => setAnswers({ ...answers, question1: e.target.value })}
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
              onChange={(e) => setAnswers({ ...answers, question2: e.target.value })}
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
              onChange={(e) => setAnswers({ ...answers, question3: e.target.value })}
              className="mt-2 w-full p-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
              placeholder="例：「あの人」との関わりが、意外と多くの業務に影響していることに気づいた..."
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 transition-all"
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

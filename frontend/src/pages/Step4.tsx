import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkItem {
  id: number;
  name: string;
  type: string;
  motivations: string[];
  preferences: string[];
  reframe: string;
}

const Step4 = () => {
  const navigate = useNavigate();
  const [workItems, setWorkItems] = useState<WorkItem[]>([
    {
      id: 1,
      name: '定例会議の資料作成',
      type: 'タスク',
      motivations: [],
      preferences: [],
      reframe: '',
    },
    {
      id: 2,
      name: 'クライアントAとの打ち合わせ',
      type: 'タスク',
      motivations: ['成長する'],
      preferences: ['社交性'],
      reframe: '顧客の課題解決を通して、提案スキルを磨く場',
    },
    {
      id: 3,
      name: '〇〇部長 (週1で報告)',
      type: '人物',
      motivations: [],
      preferences: [],
      reframe: '',
    },
  ]);

  const motivations = ['成長する', '新たなものを創造する'];
  const preferences = ['創造性', 'ユーモア', '社交性'];

  const handleReframeChange = (id: number, reframe: string) => {
    setWorkItems(workItems.map((item) => (item.id === id ? { ...item, reframe } : item)));
  };

  const handleNext = () => navigate('/step5');
  const handleBack = () => navigate('/step3');

  return (
    <main className="flex-1 p-12 flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP4 課題クラフティング</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">4/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          あなたの「動機・嗜好」を仕事に結びつけ、仕事の捉え方を変えてみましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '56.8%' }}
          ></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-8 fade-in">
        <div className="col-span-2 bg-slate-100 rounded-2xl p-6">
          <h3 className="font-bold mb-4 text-slate-700">あなたのビフォースケッチ</h3>
          <div className="grid grid-cols-2 gap-6">
            {workItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg p-4 shadow-sm ${item.reframe && 'ring-2 ring-orange-300'}`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-base font-semibold">{item.name}</p>
                  <span
                    className={`text-xs ${
                      item.type === 'タスク'
                        ? 'text-slate-400'
                        : item.type === '人物'
                          ? 'text-teal-500'
                          : 'text-amber-500'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                {item.motivations.length > 0 || item.preferences.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.motivations.map((m, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold py-1 px-2 rounded-full text-orange-600 bg-orange-200"
                      >
                        {m}
                      </span>
                    ))}
                    {item.preferences.map((p, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold py-1 px-2 rounded-full text-amber-600 bg-amber-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3">
                  <div className="text-center text-slate-400 text-sm">↓</div>
                  <input
                    type="text"
                    value={item.reframe}
                    onChange={(e) => handleReframeChange(item.id, e.target.value)}
                    className={`w-full text-center bg-transparent focus:outline-none border-b ${
                      item.reframe
                        ? 'border-slate-400 focus:border-orange-500'
                        : 'border-dashed border-slate-300 focus:border-orange-500'
                    } transition`}
                    placeholder="仕事の捉え直しを記入..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4">あなたの動機・嗜好パレット</h3>
            <p className="text-sm text-slate-500">
              右のタグを、左の仕事の要素にドラッグ＆ドロップしてみましょう。
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-600 mb-3">動機</h4>
            <div className="flex flex-col space-y-3">
              {motivations.map((item) => (
                <div
                  key={item}
                  className="bg-orange-200 text-orange-800 py-2 px-4 rounded-lg shadow-sm cursor-move hover:bg-orange-300 transition"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-600 mb-3">嗜好</h4>
            <div className="flex flex-col space-y-3">
              {preferences.map((item) => (
                <div
                  key={item}
                  className="bg-amber-200 text-amber-800 py-2 px-4 rounded-lg shadow-sm cursor-move hover:bg-amber-300 transition"
                >
                  {item}
                </div>
              ))}
            </div>
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

export default Step4;

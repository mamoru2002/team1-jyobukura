import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkItem {
  id: number;
  name: string;
  motivations: string[];
  preferences: string[];
  reframe: string;
  keyPerson?: string;
  actionPlan?: string;
}

const Step5 = () => {
  const navigate = useNavigate();
  const [workItems, setWorkItems] = useState<WorkItem[]>([
    { id: 1, name: '定例会議の資料作成', motivations: [], preferences: [], reframe: '' },
    {
      id: 2,
      name: 'クライアントAとの打ち合わせ',
      motivations: ['成長する'],
      preferences: ['社交性'],
      reframe: '顧客の課題解決を通して、提案スキルを磨く場',
      keyPerson: '〇〇部長',
      actionPlan: '次の提案内容について事前に壁打ちを依頼する',
    },
  ]);

  const people = ['〇〇部長', 'チームメンバー', 'クライアントA担当者'];

  const handleActionPlanChange = (id: number, actionPlan: string) => {
    setWorkItems(workItems.map((item) => (item.id === id ? { ...item, actionPlan } : item)));
  };

  const handleNext = () => navigate('/step6');
  const handleBack = () => navigate('/step4');

  return (
    <main className="flex-1 p-12 flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP5 関係性クラフティング</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">5/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          仕事のキーパーソンを特定し、関係性を向上させるプランを立てましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '71.0%' }}
          ></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-8 fade-in">
        <div className="col-span-2 bg-slate-100 rounded-2xl p-6 overflow-y-auto">
          <h3 className="font-bold mb-4 text-slate-700">あなたのクラフティング・マップ</h3>
          <div className="grid grid-cols-2 gap-6">
            {workItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-base font-semibold">{item.name}</p>
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
                {item.reframe ? (
                  <div className="mt-3">
                    <div className="text-center text-slate-400 text-sm">↓</div>
                    <p className="text-center bg-orange-50 rounded p-2 text-sm text-orange-800 font-medium">
                      {item.reframe}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-center text-slate-400 text-sm">↓</div>
                )}
                {item.keyPerson && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold py-1 px-2 rounded-full text-white bg-teal-500">
                        {item.keyPerson}
                      </span>
                      <span className="text-xs text-slate-400">がキーパーソン</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-teal-600">{item.keyPerson}に、</span>
                      <input
                        type="text"
                        value={item.actionPlan || ''}
                        onChange={(e) => handleActionPlanChange(item.id, e.target.value)}
                        className="flex-1 bg-transparent focus:outline-none border-b border-dashed border-slate-300 focus:border-teal-500 transition"
                        placeholder="〇〇する"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4">人物パレット</h3>
            <p className="text-sm text-slate-500">
              右の人物タグを、関連する仕事にドラッグ＆ドロップしましょう。
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-600 mb-3">あなたのビフォースケッチから</h4>
            <div className="flex flex-col space-y-3">
              {people.map((person) => (
                <div
                  key={person}
                  className="bg-teal-200 text-teal-800 py-2 px-4 rounded-lg shadow-sm cursor-move hover:bg-teal-300 transition"
                >
                  {person}
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-orange-600 font-semibold hover:text-orange-700">
              + 新しい人物を追加
            </button>
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

export default Step5;

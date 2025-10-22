import { useState, useEffect } from 'react';
import { getWorkItems } from '../services/api';
import type { WorkItem } from '../types';

const Step7_1 = () => {
  const [nextActions, setNextActions] = useState('');
  const [collaborators, setCollaborators] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkItems();
  }, []);

  const loadWorkItems = async () => {
    try {
      const userId = 1; // 仮のユーザーID
      const items = await getWorkItems(userId);
      setWorkItems(items);
    } catch (error) {
      console.error('ワークアイテムの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuest = () => {
    // 入力内容をlocalStorageに保存
    const planData = {
      nextActions,
      collaborators,
      obstacles,
    };
    localStorage.setItem('step7-1-plan', JSON.stringify(planData));

    // STEP7-2に移動
    window.location.href = '/step7-2';
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800">STEP7-1 アクションプランニング</h1>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">7/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          計画を、実行可能なクエストに分解するために質問に答えましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '92.6%' }}
          ></div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Crafting Map */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            あなたのクラフティング・マップ
          </h2>

          {/* Work Item Cards */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-500">読み込み中...</p>
            </div>
          ) : workItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">まだクラフティングマップが作成されていません</p>
              <p className="text-sm text-slate-400 mt-2">STEP 1-6 でマップを作成してください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-800 mb-2">{item.name}</h3>
                  <div className="mb-3">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.energy_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{item.energy_percentage}%</p>
                  </div>
                  {item.reframe && <p className="text-sm text-slate-600 mb-3">{item.reframe}</p>}
                  <div className="flex flex-wrap gap-2">
                    {item.motivations?.map((motivation) => (
                      <span
                        key={motivation.id}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                      >
                        {motivation.name}
                      </span>
                    ))}
                    {item.preferences?.map((preference) => (
                      <span
                        key={preference.id}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {preference.name}
                      </span>
                    ))}
                    {item.people?.map((person) => (
                      <span
                        key={person.id}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                      >
                        {person.name}
                      </span>
                    ))}
                    {item.role_categories?.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Input Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">
              次の1週間/1ヶ月で、何ができますか？
            </h3>
            <textarea
              value={nextActions}
              onChange={(e) => setNextActions(e.target.value)}
              placeholder="(例) 部長に壁打ちを依頼する"
              className="w-full h-24 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">
              助けてくれそうな人は誰ですか？ (3人まで)
            </h3>
            <textarea
              value={collaborators}
              onChange={(e) => setCollaborators(e.target.value)}
              placeholder="(例) ○○さん、△△さん"
              className="w-full h-20 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">
              考えられる障壁と、その乗り越え方は？
            </h3>
            <textarea
              value={obstacles}
              onChange={(e) => setObstacles(e.target.value)}
              placeholder="(例) 障壁:時間がない→対策: カレンダーでタスクの時間をブロックする"
              className="w-full h-24 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <button
            onClick={handleCreateQuest}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            次に進む
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step7_1;

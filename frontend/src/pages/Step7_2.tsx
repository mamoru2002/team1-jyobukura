import { useState, useEffect } from 'react';

interface Quest {
  id: number;
  name: string;
  xp: number;
}

interface PlanData {
  nextActions: string;
  collaborators: string;
  obstacles: string;
}

const Step7_2 = () => {
  const [newQuest, setNewQuest] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [quests, setQuests] = useState<Quest[]>([
    { id: 1, name: '部長に壁打ちを依頼する', xp: 50 },
    { id: 2, name: '朝の15分、資料フォーマットを学習する', xp: 20 },
  ]);
  const [planData, setPlanData] = useState<PlanData | null>(null);

  // 難易度に応じたXPの自動割り振り
  const getXpByDifficulty = (difficulty: 'easy' | 'normal' | 'hard'): number => {
    switch (difficulty) {
      case 'easy':
        return 10;
      case 'normal':
        return 30;
      case 'hard':
        return 50;
      default:
        return 30;
    }
  };

  useEffect(() => {
    // STEP7-1から保存されたデータを読み込み
    const savedPlan = localStorage.getItem('step7-1-plan');
    if (savedPlan) {
      setPlanData(JSON.parse(savedPlan));
    }

    // 保存されているクエストを読み込み
    const savedQuests = localStorage.getItem('step7-2-quests');
    if (savedQuests) {
      setQuests(JSON.parse(savedQuests));
    }
  }, []);

  // クエストが変更されるたびにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('step7-2-quests', JSON.stringify(quests));
  }, [quests]);

  const handleAddQuest = () => {
    if (newQuest.trim()) {
      const quest: Quest = {
        id: Date.now(),
        name: newQuest,
        xp: getXpByDifficulty(selectedDifficulty),
      };
      setQuests([...quests, quest]);
      setNewQuest('');
      setSelectedDifficulty('normal'); // リセット
    }
  };

  const handleDeleteQuest = (id: number) => {
    setQuests(quests.filter((quest) => quest.id !== id));
  };

  const handleComplete = () => {
    window.location.href = '/step8';
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-slate-800">STEP7-2 クエストボード作成</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">7/7</span>
            <div className="w-32 h-2 bg-slate-200 rounded-full">
              <div className="w-full h-full bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-slate-600">
          計画を、実行可能なクエストに分解しましょう。完了すると経験値 (XP) がもらえます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Your Plan */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">あなたのプラン</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">次の1週間/1ヶ月でやること</h3>
                <p className="text-sm text-slate-600">
                  {planData?.nextActions || 'まだ入力されていません'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 mb-2">協力者</h3>
                <p className="text-sm text-slate-600">
                  {planData?.collaborators || 'まだ入力されていません'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 mb-2">障壁と対策</h3>
                <p className="text-sm text-slate-600">
                  {planData?.obstacles || 'まだ入力されていません'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quest Management */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">クエスト管理</h2>

            {/* Quest Input */}
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={newQuest}
                onChange={(e) => setNewQuest(e.target.value)}
                placeholder="新しいクエストを入力..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddQuest()}
              />

              {/* 難易度選択 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDifficulty('easy')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    selectedDifficulty === 'easy'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  優しい (10 XP)
                </button>
                <button
                  onClick={() => setSelectedDifficulty('normal')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    selectedDifficulty === 'normal'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  普通 (30 XP)
                </button>
                <button
                  onClick={() => setSelectedDifficulty('hard')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    selectedDifficulty === 'hard'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  難しい (50 XP)
                </button>
              </div>

              <button
                onClick={handleAddQuest}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                クエストを追加
              </button>
            </div>

            {/* Quest List */}
            <div className="space-y-3">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-slate-800">{quest.name}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      +{quest.xp} XP
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteQuest(quest.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            完了してクエストボードへ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step7_2;

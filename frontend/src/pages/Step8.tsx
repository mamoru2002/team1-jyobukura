import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../services/api';
import type { User } from '../types';
import './Step8.css';

interface LocalQuest {
  id: number;
  name: string;
  xp: number;
}


interface WorkItem {
  id: number;
  name: string;
  energyPercentage: number;
  motivations: string[];
  preferences: string[];
  plan: {
    person: string | null;
    action: string;
  } | null;
  roles: string[];
}

const Step8 = () => {
  const navigate = useNavigate();
  const userId = 1; // 仮のユーザーID
  const [, setUser] = useState<User | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]); // STEP6のWorkItems
  const [quests, setQuests] = useState<LocalQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  console.log('STEP8 component rendered');

  useEffect(() => {
    loadDashboard();
    loadLocalQuests();
    loadUserProgress();
    loadStep6WorkItems(); // STEP6のWorkItemsを読み込む
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard(userId);
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error('ダッシュボードの読み込みに失敗しました:', error);
      setLoading(false);
    }
  };

  const loadLocalQuests = () => {
    const savedQuests = localStorage.getItem('step7-2-quests');
    if (savedQuests) {
      setQuests(JSON.parse(savedQuests));
    }
  };


  const loadStep6WorkItems = () => {
    const savedWorkItems = localStorage.getItem('step6-work-items');
    if (savedWorkItems) {
      setWorkItems(JSON.parse(savedWorkItems));
    }
  };

  const loadUserProgress = () => {
    const savedLevel = localStorage.getItem('user-level');
    const savedXp = localStorage.getItem('user-xp');
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedXp) setXp(parseInt(savedXp));
  };

  const handleCompleteQuest = (questId: number) => {
    const quest = quests.find((q: LocalQuest) => q.id === questId);
    if (!quest) return;

    // XPを加算
    let newXp = xp + quest.xp;
    let newLevel = level;

    // レベルアップ判定（100 XPで1レベルアップ）
    while (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
    }

    // 状態を更新
    setXp(newXp);
    setLevel(newLevel);
    localStorage.setItem('user-xp', newXp.toString());
    localStorage.setItem('user-level', newLevel.toString());
  };

  const handleEditJobcrafting = () => {
    navigate('/step7-2');
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="step8-container">
      {/* ヘッダー - レベル情報 */}
      <div className="dashboard-header">
        <div className="level-display">
          <div className="user-level">
            <div className="level-info">
              <span className="level-label">レベル</span>
              <span className="level-number">{level}</span>
            </div>
            <div className="xp-bar-container">
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xp}%` }}></div>
              </div>
              <div className="xp-text">{xp} / 100 XP</div>
            </div>
          </div>
        </div>
        <button onClick={handleEditJobcrafting} className="edit-jobcrafting-btn">
          ジョブクラを修正する
        </button>
      </div>

            {/* 空状態 - クラフトマップもクエストもない場合 */}
            {workItems.length === 0 && quests.length === 0 ? (
        <div className="empty-dashboard">
          <div className="empty-content">
            <h2>ようこそ！</h2>
            <p>ジョブクラフティングを始めて、あなたの仕事を再設計しましょう。</p>
            <button onClick={() => navigate('/step1')} className="start-jobcrafting-btn">
              ジョブクラを実行する
            </button>
          </div>
        </div>
      ) : (
        <div className="dashboard-layout">
          {/* 左側 - クラフティングマップ */}
          <div className="left-section">
            <h2>クラフティングマップ</h2>
            {workItems.length === 0 ? (
              <div className="empty-state">
                <p>まだクラフティングマップが作成されていません</p>
                <button onClick={() => navigate('/step1')} className="start-btn">
                  ジョブクラを実行する
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {workItems.map((item: WorkItem) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* タイトル */}
                    <p className="text-base font-semibold break-words mb-2">{item.name}</p>

                    {/* エネルギー（Step2 と同じ表現） */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">エネルギー</span>
                        <span className="text-xs font-medium text-slate-800">
                          {item.energyPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${item.energyPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 動機・嗜好（Step4） */}
                    {(item.motivations.length > 0 || item.preferences.length > 0) && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {item.motivations.map((motivation: string, index: number) => (
                          <span
                            key={`m-${index}-${motivation}`}
                            className="text-xs font-semibold py-1 px-2 rounded-full text-orange-600 bg-orange-200"
                          >
                            {motivation}
                          </span>
                        ))}
                        {item.preferences.map((preference: string, index: number) => (
                          <span
                            key={`p-${index}-${preference}`}
                            className="text-xs font-semibold py-1 px-2 rounded-full text-amber-600 bg-amber-200"
                          >
                            {preference}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 計画（Step5） */}
                    {item.plan && (
                      <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs text-blue-700 font-medium mb-1">アクションプラン</div>
                        {item.plan.person && (
                          <div className="text-xs text-blue-600 mb-1">
                            <span className="font-medium">誰に:</span> {item.plan.person}
                          </div>
                        )}
                        <div className="text-xs text-blue-600">
                          <span className="font-medium">何をする:</span> {item.plan.action}
                        </div>
                      </div>
                    )}

                    {/* 役割（Step6で付与） */}
                    <div className="border-t border-slate-200 pt-3 min-h-[32px] flex flex-wrap gap-2">
                      {item.roles.length === 0 ? (
                        <span className="text-xs text-slate-400">（役割なし）</span>
                      ) : (
                        item.roles.map((role: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs font-semibold py-1 px-2 rounded-full text-white bg-green-500"
                          >
                            {role}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右側 - クエストリスト */}
          <div className="right-section">
            <h2>クエストリスト</h2>
            {quests.length === 0 ? (
              <div className="empty-state">
                <p>まだクエストが登録されていません</p>
              </div>
            ) : (
                    <ul className="quests-list">
                      {quests.map((quest: LocalQuest) => (
                        <li key={quest.id} className="quest-card">
                          <div className="quest-content">
                            <button onClick={() => handleCompleteQuest(quest.id)} className="complete-btn">
                              達成！
                            </button>

                            <div className="quest-details">
                              <h3>{quest.name}</h3>
                              <div className="quest-badges">
                                <span className="xp-badge">+{quest.xp} XP</span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step8;

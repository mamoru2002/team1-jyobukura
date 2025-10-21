import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, completeAction } from '../services/api';
import type { User, WorkItem, Action } from '../types';
import './Step8.css';

interface LocalQuest {
  id: number;
  name: string;
  xp: number;
}

const Step8 = () => {
  const navigate = useNavigate();
  const userId = 1; // 仮のユーザーID
  const [user, setUser] = useState<User | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [quests, setQuests] = useState<LocalQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    loadDashboard();
    loadLocalQuests();
    loadUserProgress();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard(userId);
      setUser(data.user);
      setWorkItems(data.work_items || []);
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

  const loadUserProgress = () => {
    const savedLevel = localStorage.getItem('user-level');
    const savedXp = localStorage.getItem('user-xp');
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedXp) setXp(parseInt(savedXp));
  };

  const saveUserProgress = (newXp: number, newLevel: number) => {
    localStorage.setItem('user-xp', newXp.toString());
    localStorage.setItem('user-level', newLevel.toString());
  };

  const handleCompleteQuest = (questId: number) => {
    const quest = quests.find((q) => q.id === questId);
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
    saveUserProgress(newXp, newLevel);

    // レベルアップの通知
    if (newLevel > level) {
      alert(`🎉 レベルアップ！ レベル ${newLevel} になりました！\n${quest.xp} XP を獲得しました！`);
    } else {
      alert(`🎉 クエスト達成！ ${quest.xp} XP を獲得しました！`);
    }
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
          <h1>ダッシュボード</h1>
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
          ✏️ ジョブクラを修正する
        </button>
      </div>

      {/* 空状態 - クラフトマップもクエストもない場合 */}
      {workItems.length === 0 && quests.length === 0 ? (
        <div className="empty-dashboard">
          <div className="empty-content">
            <h2>ようこそ！</h2>
            <p>ジョブクラフティングを始めて、あなたの仕事を再設計しましょう。</p>
            <button onClick={() => navigate('/step1')} className="start-jobcrafting-btn">
              🚀 ジョブクラを実行する
            </button>
          </div>
        </div>
      ) : (
        <div className="dashboard-layout">
          {/* 左側 - クラフティングマップ */}
          <div className="left-section">
            <h2>📊 クラフティングマップ</h2>
            {workItems.length === 0 ? (
              <div className="empty-state">
                <p>まだクラフティングマップが作成されていません</p>
                <button onClick={() => navigate('/step1')} className="start-btn">
                  ジョブクラを実行する
                </button>
              </div>
            ) : (
              <div className="work-items-grid">
                {workItems.map((item) => (
                  <div key={item.id} className="work-item-card">
                    <h3>{item.name}</h3>
                    <div className="energy-bar">
                      <div
                        className="energy-fill"
                        style={{ width: `${item.energy_percentage}%` }}
                      ></div>
                    </div>
                    <p className="energy-percentage">{item.energy_percentage}%</p>

                    {item.reframe && <p className="reframe">{item.reframe}</p>}

                    <div className="work-item-tags">
                      {item.motivations.length > 0 && (
                        <div className="tag-group">
                          <span className="tag-label">動機:</span>
                          {item.motivations.map((m) => (
                            <span key={m.id} className="tag motivation">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.preferences.length > 0 && (
                        <div className="tag-group">
                          <span className="tag-label">嗜好:</span>
                          {item.preferences.map((p) => (
                            <span key={p.id} className="tag preference">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右側 - クエストリスト */}
          <div className="right-section">
            <h2>🎯 クエストリスト</h2>
            {quests.length === 0 ? (
              <div className="empty-state">
                <p>まだクエストが登録されていません</p>
              </div>
            ) : (
              <ul className="quests-list">
                {quests.map((quest) => (
                  <li key={quest.id} className="quest-card">
                    <div className="quest-content">
                    <button onClick={() => handleCompleteQuest(quest.id)} className="complete-btn">
                      達成！
                    </button>

                      <div className="quest-details">
                        <h3>{quest.name}</h3>
                        <div className="quest-badges">
                          <span className="xp-badge">⭐ {quest.xp} XP</span>
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

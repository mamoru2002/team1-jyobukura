import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, completeAction } from '../services/api';
import type { User, WorkItem, Action } from '../types';
import './Step8.css';

const Step8 = () => {
  const navigate = useNavigate();
  const userId = 1; // 仮のユーザーID
  const [user, setUser] = useState<User | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [quests, setQuests] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard(userId);
      setUser(data.user);
      setWorkItems(data.work_items || []);
      // クエストのみをフィルタリング
      const questsOnly = (data.actions || []).filter(
        (action: Action) => action.action_type === 'クエスト'
      );
      setQuests(questsOnly);
      setLoading(false);
    } catch (error) {
      console.error('ダッシュボードの読み込みに失敗しました:', error);
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId: number) => {
    try {
      const result = await completeAction(questId);

      // ユーザー情報を更新
      if (result.user) {
        setUser(result.user);
      }

      // ダッシュボードを再読み込み
      await loadDashboard();

      // 経験値獲得のアニメーション（オプション）
      alert(`🎉 クエスト達成！ ${result.xp_gained} XP を獲得しました！`);
    } catch (error) {
      console.error('クエストの達成に失敗しました:', error);
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
          {user && (
            <div className="user-level">
              <div className="level-info">
                <span className="level-label">レベル</span>
                <span className="level-number">{user.level}</span>
              </div>
              <div className="xp-bar-container">
                <div className="xp-bar">
                  <div className="xp-fill" style={{ width: `${user.xp_percentage}%` }}></div>
                </div>
                <div className="xp-text">{user.experience_points} / 100 XP</div>
              </div>
            </div>
          )}
        </div>
        <button onClick={handleEditJobcrafting} className="edit-jobcrafting-btn">
          ✏️ ジョブクラを修正する
        </button>
      </div>

      <div className="dashboard-layout">
        {/* 左側 - クラフティングマップ */}
        <div className="left-section">
          <h2>📊 クラフティングマップ</h2>
          {workItems.length === 0 ? (
            <div className="empty-state">
              <p>まだクラフティングマップが作成されていません</p>
              <p className="hint">STEP 1-6 でマップを作成してください</p>
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
              <button onClick={handleEditJobcrafting} className="create-quest-btn">
                クエストを作成する
              </button>
            </div>
          ) : (
            <ul className="quests-list">
              {quests.map((quest) => (
                <li key={quest.id} className="quest-card">
                  <div className="quest-content">
                    <button onClick={() => handleCompleteQuest(quest.id)} className="complete-btn">
                      ✅ 達成！
                    </button>

                    <div className="quest-details">
                      <h3>{quest.name}</h3>
                      {quest.description && (
                        <p className="quest-description">{quest.description}</p>
                      )}

                      <div className="quest-badges">
                        <span className={`difficulty-badge ${quest.difficulty}`}>
                          {quest.difficulty === 'easy' && '🟢 簡単'}
                          {quest.difficulty === 'medium' && '🟡 普通'}
                          {quest.difficulty === 'hard' && '🔴 難しい'}
                        </span>
                        <span className="xp-badge">⭐ {quest.xp_points} XP</span>
                        <span className="type-badge">
                          {quest.quest_type === 'one_time' ? '📌 単発' : '🔄 連続'}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step8;

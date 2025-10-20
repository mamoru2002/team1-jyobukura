import { useState, useEffect } from 'react';
import { createAction, getActions, updateAction, deleteAction } from '../services/api';
import type { Action } from '../types';
import './Step7.css';

const Step7_2 = () => {
  const userId = 1; // 仮のユーザーID
  const [quests, setQuests] = useState<Action[]>([]);
  const [questName, setQuestName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [questType, setQuestType] = useState<'one_time' | 'recurring'>('one_time');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const data = await getActions(userId);
      // クエストのみをフィルタリング
      const questsOnly = data.filter((action) => action.action_type === 'クエスト');
      setQuests(questsOnly);
    } catch (error) {
      console.error('クエストの読み込みに失敗しました:', error);
    }
  };

  const getXpFromDifficulty = (diff: string): number => {
    switch (diff) {
      case 'easy':
        return 10;
      case 'medium':
        return 30;
      case 'hard':
        return 50;
      default:
        return 0;
    }
  };

  const handleAddQuest = async () => {
    if (!questName.trim()) return;

    const newQuest = {
      user_id: userId,
      name: questName,
      description,
      action_type: 'クエスト' as const,
      difficulty,
      quest_type: questType,
      xp_points: getXpFromDifficulty(difficulty),
      status: '未着手' as const,
    };

    try {
      if (editingId) {
        await updateAction(editingId, newQuest);
        setEditingId(null);
      } else {
        await createAction(newQuest);
      }
      await loadQuests();
      resetForm();
    } catch (error) {
      console.error('クエストの保存に失敗しました:', error);
    }
  };

  const handleEdit = (quest: Action) => {
    setEditingId(quest.id);
    setQuestName(quest.name);
    setDescription(quest.description || '');
    setDifficulty(quest.difficulty || 'easy');
    setQuestType(quest.quest_type || 'one_time');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('このクエストを削除しますか？')) {
      try {
        await deleteAction(id);
        await loadQuests();
      } catch (error) {
        console.error('クエストの削除に失敗しました:', error);
      }
    }
  };

  const resetForm = () => {
    setQuestName('');
    setDescription('');
    setDifficulty('easy');
    setQuestType('one_time');
    setEditingId(null);
  };

  return (
    <div className="step7-container">
      <h1>STEP 7-2: クエスト管理</h1>

      <div className="step7-layout">
        <div className="left-panel">
          <h2>登録済みクエスト</h2>
          {quests.length === 0 ? (
            <p className="empty-message">まだクエストが登録されていません</p>
          ) : (
            <ul className="quests-list">
              {quests.map((quest) => (
                <li key={quest.id} className="quest-item">
                  <div className="quest-header">
                    <h3>{quest.name}</h3>
                    <span className={`difficulty-badge ${quest.difficulty}`}>
                      {quest.difficulty === 'easy' && '🟢 簡単'}
                      {quest.difficulty === 'medium' && '🟡 普通'}
                      {quest.difficulty === 'hard' && '🔴 難しい'}
                    </span>
                  </div>
                  {quest.description && <p className="quest-description">{quest.description}</p>}
                  <div className="quest-meta">
                    <span className="xp-badge">⭐ {quest.xp_points} XP</span>
                    <span className="type-badge">
                      {quest.quest_type === 'one_time' ? '📌 単発' : '🔄 連続'}
                    </span>
                  </div>
                  <div className="quest-actions">
                    <button onClick={() => handleEdit(quest)} className="edit-btn">
                      編集
                    </button>
                    <button onClick={() => handleDelete(quest.id)} className="delete-btn">
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="right-panel">
          <h2>{editingId ? 'クエストを編集' : 'クエストを追加'}</h2>

          <div className="form-group">
            <label>クエスト名</label>
            <input
              type="text"
              value={questName}
              onChange={(e) => setQuestName(e.target.value)}
              placeholder="クエスト名を入力..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>説明（任意）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="クエストの説明を入力..."
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label>難易度</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="form-select"
            >
              <option value="easy">🟢 簡単 (10 XP)</option>
              <option value="medium">🟡 普通 (30 XP)</option>
              <option value="hard">🔴 難しい (50 XP)</option>
            </select>
          </div>

          <div className="form-group">
            <label>タイプ</label>
            <select
              value={questType}
              onChange={(e) => setQuestType(e.target.value as 'one_time' | 'recurring')}
              className="form-select"
            >
              <option value="one_time">📌 単発（達成後に削除）</option>
              <option value="recurring">🔄 連続（繰り返し可能）</option>
            </select>
          </div>

          <div className="button-group">
            <button onClick={handleAddQuest} className="add-button">
              {editingId ? '更新する' : '追加する'}
            </button>
            {editingId && (
              <button onClick={resetForm} className="cancel-button">
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7_2;

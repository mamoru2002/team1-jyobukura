import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActionPlan } from '../services/api';
import './Step7.css';

const Step7_1 = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  const userId = 1; // 仮のユーザーID

  const handleAddQuestion = async () => {
    if (question.trim()) {
      const newQuestions = [...savedQuestions, question];
      setSavedQuestions(newQuestions);

      // APIに保存
      try {
        await createActionPlan({
          user_id: userId,
          next_actions: newQuestions.join('\n'),
        });
      } catch (error) {
        console.error('質問の保存に失敗しました:', error);
      }

      setQuestion('');
    }
  };

  const handleNext = () => {
    navigate('/step7-2');
  };

  return (
    <div className="step7-container">
      <h1>STEP 7-1: アクションプラン</h1>

      <div className="step7-layout">
        <div className="left-panel">
          <h2>保存された質問</h2>
          {savedQuestions.length === 0 ? (
            <p className="empty-message">まだ質問が追加されていません</p>
          ) : (
            <ul className="questions-list">
              {savedQuestions.map((q, index) => (
                <li key={index} className="question-item">
                  {q}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="right-panel">
          <h2>質問を入力</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="次のアクションに関する質問を入力してください..."
            className="question-textarea"
          />
          <button onClick={handleAddQuestion} className="add-button">
            質問を追加
          </button>

          <div className="navigation-buttons">
            <button onClick={handleNext} className="next-button">
              STEP 7-2へ進む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7_1;

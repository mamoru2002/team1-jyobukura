import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Step3 = () => {
  const navigate = useNavigate();
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([
    '成長する',
    '新たなものを創造する',
  ]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['創造性', 'ユーモア']);
  const [customMotivation, setCustomMotivation] = useState('');
  const [customPreference, setCustomPreference] = useState('');

  const motivations = [
    '自由を求める',
    '成長する',
    '楽しさを求める',
    '達成感を得る',
    '安心を得る',
    '人を助ける',
    '新たなものを創造する',
  ];
  const preferences = [
    '判断力',
    'よく考える',
    '創造性',
    '専門性',
    '忍耐力',
    'ユーモア',
    'ものごとを整理する',
  ];

  const beforeSketchItems = [
    { content: '定例会議の資料作成', type: 'タスク' },
    { content: 'クライアントAとの打ち合わせ', type: 'タスク' },
    { content: '〇〇部長 (週1で報告)', type: '人物' },
    { content: 'チームメンバーとの雑談', type: '人物' },
    { content: 'Excelスキル', type: 'スキル' },
  ];

  const toggleMotivation = (item: string) => {
    setSelectedMotivations((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const togglePreference = (item: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomMotivation = () => {
    if (customMotivation.trim()) {
      setSelectedMotivations([...selectedMotivations, customMotivation]);
      setCustomMotivation('');
    }
  };

  const addCustomPreference = () => {
    if (customPreference.trim()) {
      setSelectedPreferences([...selectedPreferences, customPreference]);
      setCustomPreference('');
    }
  };

  const handleNext = () => navigate('/step4');
  const handleBack = () => navigate('/step2');

  return (
    <main className="flex-1 p-12 flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP3 動機と嗜好のピックアップ</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">3/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          あなたの仕事の原動力となる価値観を選んでみましょう。それぞれ3〜4個が目安です。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '42.6%' }}
          ></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-8 fade-in">
        <div className="flex flex-col space-y-8 overflow-y-auto pr-4">
          <div>
            <h3 className="text-xl font-bold mb-1">動機</h3>
            <p className="text-sm text-slate-500 mb-4">
              仕事を通じて、どのような価値観を達成したいですか？
            </p>
            <div className="flex flex-wrap gap-3">
              {motivations.map((item) => (
                <span
                  key={item}
                  onClick={() => toggleMotivation(item)}
                  className={`py-2 px-4 rounded-full cursor-pointer transition-all ${
                    selectedMotivations.includes(item)
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={customMotivation}
                onChange={(e) => setCustomMotivation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomMotivation()}
                placeholder="カスタムで動機を追加..."
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none transition-all"
              />
              <button
                onClick={addCustomMotivation}
                className="px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                追加
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-1">嗜好</h3>
            <p className="text-sm text-slate-500 mb-4">
              仕事を通じて、どのような能力やスキルを発揮したいですか？
            </p>
            <div className="flex flex-wrap gap-3">
              {preferences.map((item) => (
                <span
                  key={item}
                  onClick={() => togglePreference(item)}
                  className={`py-2 px-4 rounded-full cursor-pointer transition-all ${
                    selectedPreferences.includes(item)
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={customPreference}
                onChange={(e) => setCustomPreference(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomPreference()}
                placeholder="カスタムで嗜好を追加..."
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none transition-all"
              />
              <button
                onClick={addCustomPreference}
                className="px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                追加
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold mb-4 text-slate-700">あなたのビフォースケッチ（STEP1）</h3>
          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4">
            {beforeSketchItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow-sm flex flex-col justify-between"
              >
                <p className="text-sm">{item.content}</p>
                <div
                  className={`text-right text-xs ${
                    item.type === 'タスク'
                      ? 'text-slate-400'
                      : item.type === '人物'
                        ? 'text-teal-500'
                        : 'text-amber-500'
                  }`}
                >
                  {item.type}
                </div>
              </div>
            ))}
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

export default Step3;

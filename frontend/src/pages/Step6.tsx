import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkItem {
  id: number;
  name: string;
  reframe: string;
  roles: string[];
}

const Step6 = () => {
  const navigate = useNavigate();
  const [newRole, setNewRole] = useState('');
  const [roles, setRoles] = useState<string[]>([
    'チームの知見を集約するハブ役',
    '顧客価値を最大化する提案者',
    'チームの心理的安全性を高める調整役',
  ]);

  useEffect(() => {
    // 保存されたデータを読み込み
    const savedRoles = localStorage.getItem('step6-roles');
    const savedWorkItems = localStorage.getItem('step6-work-items');

    if (savedRoles) {
      setRoles(JSON.parse(savedRoles));
    }
    if (savedWorkItems) {
      setWorkItems(JSON.parse(savedWorkItems));
    }
  }, []);

  const [workItems, setWorkItems] = useState<WorkItem[]>([
    {
      id: 1,
      name: '定例会議の資料作成',
      reframe: '部署の成果を分かりやすく伝え、次のアクションを促す',
      roles: ['チームの知見を集約するハブ役'],
    },
    {
      id: 2,
      name: 'クライアントAとの打ち合わせ',
      reframe: '顧客の課題解決を通して、提案スキルを磨く場',
      roles: ['顧客価値を最大化する提案者', 'チームの知見を集約するハブ役'],
    },
    { id: 3, name: '〇〇部長との報告', reframe: '', roles: [] },
  ]);

  const saveData = () => {
    localStorage.setItem('step6-roles', JSON.stringify(roles));
    localStorage.setItem('step6-work-items', JSON.stringify(workItems));
  };

  const addRole = () => {
    if (newRole.trim()) {
      const newRoles = [...roles, newRole];
      setRoles(newRoles);
      setNewRole('');
      localStorage.setItem('step6-roles', JSON.stringify(newRoles));
    }
  };

  const handleNext = () => {
    saveData();
    navigate('/step7-1');
  };
  const handleBack = () => navigate('/step5');

  return (
    <main className="flex-1 p-12 flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP6 認知クラフティング</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">6/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          あなたの仕事全体を俯瞰し、自分自身の「役割」を定義してみましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '85.2%' }}
          ></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-8 fade-in">
        <div className="flex flex-col space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">1. あなたの「役割」を定義する</h3>
            <p className="text-sm text-slate-500 mb-4">
              現在の仕事全体に対しての認識を捉え直し、自分自身が果たしたい役割を自由に言葉にしてみましょう。
            </p>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label htmlFor="role-input" className="font-semibold text-slate-600">
                新しい役割名
              </label>
              <input
                type="text"
                id="role-input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRole()}
                className="mt-2 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                placeholder="例：チームの知見を集約するハブ役"
              />
              <button
                onClick={addRole}
                className="mt-3 w-full bg-orange-600 text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition-all"
              >
                役割を追加
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">2. 役割を仕事にタグ付けする</h3>
            <p className="text-sm text-slate-500 mb-4">
              作成した役割タグを、右の仕事カードにドラッグ＆ドロップして紐づけましょう。
            </p>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role}
                  className="bg-green-200 text-green-800 py-2 px-4 rounded-lg shadow-sm cursor-move hover:bg-green-300 transition"
                >
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-slate-100 rounded-2xl p-6 overflow-y-auto">
          <h3 className="font-bold mb-4 text-slate-700">あなたのクラフティング・マップ</h3>
          <div className="grid grid-cols-2 gap-6">
            {workItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-base font-semibold">{item.name}</p>
                {item.reframe ? (
                  <p className="text-center bg-orange-50 rounded p-2 text-xs text-orange-800 mt-2">
                    {item.reframe}
                  </p>
                ) : (
                  <p className="text-center bg-slate-50 rounded p-2 text-xs text-slate-600 mt-2">
                    （仕事の捉え直しを記入）
                  </p>
                )}
                <div className="mt-3 border-t pt-3 min-h-[32px] flex flex-wrap gap-2">
                  {item.roles.map((role, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold py-1 px-2 rounded-full text-white bg-green-500"
                    >
                      {role}
                    </span>
                  ))}
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

export default Step6;

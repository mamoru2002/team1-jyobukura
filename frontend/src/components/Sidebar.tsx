import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/step1', label: 'STEP1 ビフォースケッチ' },
    { path: '/step2', label: 'STEP2 省察' },
    { path: '/step3', label: 'STEP3 動機・嗜好' },
    { path: '/step4', label: 'STEP4 業務クラフティング' },
    { path: '/step5', label: 'STEP5 関係性クラフティング' },
    { path: '/step6', label: 'STEP6 認知クラフティング' },
    { path: '/step7-1', label: 'STEP7-1 アクションプラン' },
    { path: '/step7-2', label: 'STEP7-2 クエストボード' },
  ];

  const completedSteps: string[] = [];

  const isCompleted = (path: string) => completedSteps.includes(path);
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white p-8 border-r border-slate-200 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-orange-600 mb-12">ジョブクラ！</h1>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block ${
                isActive(item.path)
                  ? 'text-orange-600 font-bold'
                  : isCompleted(item.path)
                    ? 'text-blue-500 relative pl-5 before:content-["✓"] before:absolute before:left-0 before:font-bold'
                    : 'text-slate-400'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div>
        <Link
          to="/step8"
          className="block bg-green-600 text-white text-center py-3 px-4 rounded-lg font-bold hover:bg-green-700 transition-all"
        >
          📊 ダッシュボード
        </Link>
        <div className="mt-6 text-sm text-slate-400">
          <p>山本航暉さん</p>
          <a href="#" className="hover:text-orange-600">
            ログアウト
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

// src/pages/Step6.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** LocalStorage Keys（Step5と整合） */
const LS = {
  step1Cards: 'step1-cards', // Step1 のカード
  step4Assignments: 'step4CardAssignments', // Step4 のカード×タグ紐づけ（配列）
  step5People: 'step5People', // Step5 の人物パレット
  step5Plans: 'step5CardPlans', // Step5 のカードごとの計画
  step6Roles: 'step6-roles', // 役割パレット
  step6WorkItems: 'step6-work-items', // 各カードへの役割割り当てスナップショット
} as const;

/** 上限 */
const MAX_ROLES_TOTAL = 3;

/** 型 */
type Step1Card = {
  id: number;
  content: string;
  energyPercentage: number;
};

type SelectionType = 'motivation' | 'preference';

type Step4Assignment = {
  cardId: number;
  itemId: string; // 例: "motivation:%E3%81%AA%E3%81%AB%E3%81%8B"
};

type TagChip = {
  type: SelectionType;
  label: string;
};

type CardPlan = {
  person: string | null; // 誰に
  action: string; // 何をする（1文）
};

type WorkItemView = {
  id: number;
  name: string;
  energyPercentage: number;
  motivations: string[];
  preferences: string[];
  plan: CardPlan | null; // Step5 で付与
  roles: string[]; // Step6 で付与
};

/** ユーティリティ */
const parseJSON = <T,>(raw: string | null, fallback: T): T => {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const decodeItemId = (itemId: string): TagChip | null => {
  const colon = itemId.indexOf(':');
  if (colon < 0) return null;
  const head = itemId.slice(0, colon);
  const enc = itemId.slice(colon + 1);
  const type = head === 'motivation' || head === 'preference' ? head : null;
  if (!type) return null;
  try {
    const label = decodeURIComponent(enc).trim();
    if (!label) return null;
    return { type, label };
  } catch {
    return null;
  }
};

const uniquePush = (arr: string[], v: string) => (arr.includes(v) ? arr : [...arr, v]);

/** 本体 */
const Step6 = () => {
  const navigate = useNavigate();

  /** 役割パレット（保存があればそれを使用。初期投入はしない） */
  const [roles, setRoles] = useState<string[]>(() =>
    parseJSON<string[]>(localStorage.getItem(LS.step6Roles), [])
  );
  const [newRole, setNewRole] = useState('');
  const [roleError, setRoleError] = useState<string | null>(null);

  /** 表示用カード集合（Step1 + Step4のタグ + Step6の役割） */
  const [workItems, setWorkItems] = useState<WorkItemView[]>([]);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  /** 初期ロード：Step1/Step4/Step5 のデータを統合し、Step6 保存済みの役割割当があれば上書き */
  useEffect(() => {
    // Step1 カード
    const step1Cards = parseJSON<Step1Card[]>(localStorage.getItem(LS.step1Cards), []);

    // Step4 紐づけ（配列）
    const assignments = parseJSON<Step4Assignment[]>(localStorage.getItem(LS.step4Assignments), []);

    // Step5 計画（カードIDごと）
    const cardPlans = parseJSON<Record<number, CardPlan>>(localStorage.getItem(LS.step5Plans), {});

    // カードIDごとの動機/嗜好を構築
    const byCard = new Map<number, { motivations: string[]; preferences: string[] }>();
    assignments.forEach((a) => {
      const tag = decodeItemId(a.itemId);
      if (!tag) return;
      const cur = byCard.get(a.cardId) ?? { motivations: [], preferences: [] };
      if (tag.type === 'motivation') {
        cur.motivations = uniquePush(cur.motivations, tag.label);
      } else {
        cur.preferences = uniquePush(cur.preferences, tag.label);
      }
      byCard.set(a.cardId, cur);
    });

    // Step6 保存済み（カードの roles）
    const savedWork = parseJSON<WorkItemView[]>(localStorage.getItem(LS.step6WorkItems), []);

    // ベース組み立て（Step1優先）
    let base: WorkItemView[] = step1Cards.map((c) => {
      const tags = byCard.get(c.id) ?? { motivations: [], preferences: [] };
      const plan = cardPlans[c.id] ?? null;
      const saved = savedWork.find((w) => w.id === c.id);
      return {
        id: c.id,
        name: c.content || '（未入力）',
        energyPercentage: typeof c.energyPercentage === 'number' ? c.energyPercentage : 0,
        motivations: tags.motivations.slice(),
        preferences: tags.preferences.slice(),
        plan: plan,
        roles: saved?.roles ?? [],
      };
    });

    // Step1が無いけど Step6 の保存がある場合（後方互換フォールバック）
    if (base.length === 0 && savedWork.length > 0) {
      base = savedWork.map((saved) => {
        const tags = byCard.get(saved.id) ?? {
          motivations: saved.motivations ?? [],
          preferences: saved.preferences ?? [],
        };
        const plan = cardPlans[saved.id] ?? saved.plan ?? null;
        return { ...saved, motivations: tags.motivations, preferences: tags.preferences, plan };
      });
    }

    setWorkItems(base);
  }, []);

  /** 自動保存 */
  useEffect(() => {
    localStorage.setItem(LS.step6Roles, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(LS.step6WorkItems, JSON.stringify(workItems));
  }, [workItems]);

  /** 役割の追加・削除（パレット） */
  const addRole = () => {
    const name = newRole.trim();
    if (!name) return;
    if (roles.length >= MAX_ROLES_TOTAL) {
      setRoleError(`役割は最大${MAX_ROLES_TOTAL}個までです。`);
      return;
    }
    if (roles.includes(name)) {
      setRoleError('同じ役割が既にあります。');
      return;
    }
    setRoles((prev) => [...prev, name]);
    setNewRole('');
    setRoleError(null);
  };

  const removeRoleFromPalette = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role));
    // パレットから削除したら、全カードからも外す
    setWorkItems((prev) => prev.map((w) => ({ ...w, roles: w.roles.filter((r) => r !== role) })));
  };

  /** DnD: 役割ドラッグ開始（パレット） */
  const onDragStartRole = (role: string) => (ev: React.DragEvent<HTMLDivElement>) => {
    ev.dataTransfer.setData('text/plain', role);
    ev.dataTransfer.effectAllowed = 'copyMove';
  };

  /** カード側 DnD */
  const onDropToCard = useCallback((cardId: number, ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragOverId(null);
    const role = ev.dataTransfer.getData('text/plain')?.trim();
    if (!role) return;
    setWorkItems((prev) =>
      prev.map((w) => (w.id === cardId ? { ...w, roles: uniquePush(w.roles, role) } : w))
    );
  }, []);

  const onDragOver = (ev: React.DragEvent<HTMLDivElement>) => ev.preventDefault();
  const onDragEnterCard = (cardId: number) => (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragOverId(cardId);
  };
  const onDragLeaveCard = (cardId: number) => (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragOverId((cur) => (cur === cardId ? null : cur));
  };

  /** カードから役割を外す */
  const removeRoleFromCard = (cardId: number, role: string) => {
    setWorkItems((prev) =>
      prev.map((w) => (w.id === cardId ? { ...w, roles: w.roles.filter((r) => r !== role) } : w))
    );
  };

  /** 次へボタン条件：カード0件なら可 / 1件以上ならどれかに役割が付いていれば可 */
  const nextEnabled = useMemo(() => {
    if (workItems.length === 0) return true;
    return workItems.some((w) => w.roles.length > 0);
  }, [workItems]);

  const handleNext = () => navigate('/step7-1');
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
          左のクラフティング・マップを見ながら、あなたの「役割」を定義し、仕事にタグ付けしていきましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '85.2%' }}
          ></div>
        </div>
      </header>

      {/* 左：クラフティング・マップ / 右：役割パレット */}
      <div className="flex-1 grid grid-cols-3 gap-8 fade-in">
        {/* 左（2カラム） */}
        <div className="col-span-2 bg-slate-100 rounded-2xl p-6 overflow-y-auto">
          <h3 className="font-bold mb-4 text-slate-700">あなたのクラフティング・マップ</h3>

          {workItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              STEP1で入力したデータがありません
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {workItems.map((item) => {
                const isDragOver = dragOverId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ring-offset-2 ${
                      isDragOver ? 'ring-2 ring-orange-300' : ''
                    }`}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDropToCard(item.id, e)}
                    onDragEnter={onDragEnterCard(item.id)}
                    onDragLeave={onDragLeaveCard(item.id)}
                  >
                    {/* タイトル */}
                    <p className="text-base font-semibold break-words">{item.name}</p>

                    {/* エネルギー（Step2 と同じ表現） */}
                    <div className="mt-2">
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
                       <div className="mt-3 flex flex-wrap gap-2">
                         {item.motivations.map((m, i) => (
                           <span
                             key={`m-${i}-${m}`}
                             className="text-xs font-semibold py-1 px-2 rounded-full text-orange-600 bg-orange-200"
                           >
                             {m}
                           </span>
                         ))}
                         {item.preferences.map((p, i) => (
                           <span
                             key={`p-${i}-${p}`}
                             className="text-xs font-semibold py-1 px-2 rounded-full text-amber-600 bg-amber-200"
                           >
                             {p}
                           </span>
                         ))}
                       </div>
                     )}

                     {/* 計画（Step5） */}
                     {item.plan && (
                       <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
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
                    <div className="mt-4 border-t border-slate-200 pt-3 min-h-[32px] flex flex-wrap gap-2">
                      {item.roles.length === 0 ? (
                        <span className="text-xs text-slate-400">（ここへ役割をドロップ）</span>
                      ) : (
                        item.roles.map((role) => (
                          <span
                            key={role}
                            className="text-xs font-semibold py-1 px-2 rounded-full text-white bg-green-500 flex items-center gap-2"
                          >
                            {role}
                            <button
                              className="text-white/90 hover:text-white"
                              onClick={() => removeRoleFromCard(item.id, role)}
                              title="この役割を外す"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右（1カラム）：役割パレット */}
        <div className="flex flex-col space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">1. あなたの「役割」を定義する</h3>
            <p className="text-sm text-slate-500 mb-4">
              現在の仕事全体を俯瞰し、自分が果たしたい役割を自由に言葉にしてみましょう。
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRole();
                  }
                }}
                className="mt-2 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
              />
              <button
                onClick={addRole}
                disabled={roles.length >= MAX_ROLES_TOTAL}
                className="mt-3 w-full bg-orange-600 text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                役割を追加
              </button>
              {roleError && <p className="mt-2 text-sm text-red-600">{roleError}</p>}
              {roles.length >= MAX_ROLES_TOTAL && (
                <p className="mt-2 text-xs text-slate-500">※ 役割は最大{MAX_ROLES_TOTAL}個まで</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">2. 役割を仕事にタグ付けする</h3>
            <p className="text-sm text-slate-500 mb-4">
              作成した役割タグを、左の仕事カードにドラッグ＆ドロップして紐づけましょう。
            </p>
            <div className="space-y-2">
              {roles.length === 0 ? (
                <>
                  <p className="text-sm text-slate-400">
                    役割がありません。上のフォームから追加してください。
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    <p className="mb-1">例：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>組織のイメージを向上させる</li>
                      <li>チームが万全に機能するための土台を作る</li>
                    </ul>
                  </div>
                </>
              ) : (
                roles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between gap-3 bg-green-200 text-green-800 py-2 px-3 rounded-lg shadow-sm cursor-move hover:bg-green-300 transition"
                    draggable
                    onDragStart={onDragStartRole(role)}
                    title="ドラッグして左の仕事カードへドロップ"
                  >
                    <span className="font-semibold text-sm">{role}</span>
                    <button
                      type="button"
                      className="text-green-900/70 hover:text-red-700"
                      onClick={() => removeRoleFromPalette(role)}
                      title="この役割を削除（カードからも外れる）"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
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
          disabled={!nextEnabled}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          次へ進む
        </button>
      </footer>
    </main>
  );
};

export default Step6;

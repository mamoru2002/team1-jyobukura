// frontend/src/pages/Step5.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** LocalStorage Keys */
const LS_STEP1_CARDS = 'step1-cards';
const LS_STEP4_ASSIGN = 'step4CardAssignments'; // Step4 で保存したカード×タグの紐づけ
const LS_STEP5_PEOPLE = 'step5People'; // 人物パレット
const LS_STEP5_PLANS = 'step5CardPlans'; // カードごとの { person, action }

/** Types */
type SelectionType = 'motivation' | 'preference';

type WorkCard = {
  id: number;
  content: string;
  energyPercentage: number;
};

type Step4Assignment = {
  cardId: number;
  itemId: string; // "motivation:%E3%81%AA..." 等
};

type TagChip = {
  type: SelectionType;
  label: string;
};

type CardPlan = {
  person: string | null; // 誰に
  action: string; // 何をする（1文）
};

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

const Step5 = () => {
  const navigate = useNavigate();

  /** Step1 のカード（=タスク） */
  const [cards, setCards] = useState<WorkCard[]>([]);

  /** Step4 の割り当て（カード×タグ） */
  const [assignments, setAssignments] = useState<Step4Assignment[]>([]);

  /** 人物パレット（追加・削除可能） */
  const [people, setPeople] = useState<string[]>(() =>
    parseJSON<string[]>(localStorage.getItem(LS_STEP5_PEOPLE), [])
  );
  const [newPerson, setNewPerson] = useState('');

  /** カードごとの計画（人物＆動詞） */
  const [plans, setPlans] = useState<Record<number, CardPlan>>(() =>
    parseJSON<Record<number, CardPlan>>(localStorage.getItem(LS_STEP5_PLANS), {})
  );

  /** ドラッグ中ハイライト用 */
  const [dragOverCardId, setDragOverCardId] = useState<number | null>(null);

  /** 初期ロード */
  useEffect(() => {
    setCards(parseJSON<WorkCard[]>(localStorage.getItem(LS_STEP1_CARDS), []));
    setAssignments(parseJSON<Step4Assignment[]>(localStorage.getItem(LS_STEP4_ASSIGN), []));
  }, []);

  /** plans / people を都度保存 */
  useEffect(() => {
    localStorage.setItem(LS_STEP5_PLANS, JSON.stringify(plans));
  }, [plans]);
  useEffect(() => {
    localStorage.setItem(LS_STEP5_PEOPLE, JSON.stringify(people));
  }, [people]);

  /** カードIDごとのタグ一覧（Step4の結果を表示するだけ） */
  const tagsByCard = useMemo(() => {
    const map = new Map<number, TagChip[]>();
    assignments.forEach((a) => {
      const tag = decodeItemId(a.itemId);
      if (!tag) return;
      const arr = map.get(a.cardId);
      if (arr) arr.push(tag);
      else map.set(a.cardId, [tag]);
    });
    map.forEach((arr) =>
      arr.sort((x, y) =>
        x.type === y.type ? x.label.localeCompare(y.label, 'ja') : x.type === 'motivation' ? -1 : 1
      )
    );
    return map;
  }, [assignments]);

  /** 人物パレット：追加 */
  const addPerson = () => {
    const name = newPerson.trim();
    if (!name) return;
    if (people.includes(name)) {
      setNewPerson('');
      return;
    }
    setPeople((prev) => [...prev, name]);
    setNewPerson('');
  };

  /** 人物パレット：削除（割当済みカードからも外す） */
  const removePerson = (name: string) => {
    setPeople((prev) => prev.filter((p) => p !== name));
    setPlans((prev) => {
      const next: Record<number, CardPlan> = {};
      Object.entries(prev).forEach(([cardIdStr, plan]) => {
        const cardId = Number(cardIdStr);
        if (plan.person === name) {
          next[cardId] = { person: null, action: plan.action };
        } else {
          next[cardId] = plan;
        }
      });
      return next;
    });
  };

  /** ドラッグ開始（palette -> card） */
  const onDragStart = (person: string) => (ev: React.DragEvent<HTMLDivElement>) => {
    ev.dataTransfer.setData('text/plain', person);
    ev.dataTransfer.effectAllowed = 'copyMove';
  };

  /** カード側ドロップ（カード全体をターゲットに） */
  const onDropToCard = useCallback((cardId: number, ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragOverCardId(null);
    const person = ev.dataTransfer.getData('text/plain');
    if (!person) return;
    setPlans((prev) => {
      const base = prev[cardId] ?? { person: null, action: '' };
      return { ...prev, [cardId]: { ...base, person } };
    });
  }, []);
  const onDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };
  const onDragEnterCard = (cardId: number) => (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragOverCardId(cardId);
  };
  const onDragLeaveCard = (cardId: number) => (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    // 子要素経由の leave でも発火するので、境界外のみで消すのが理想だが
    // シンプルに「何かのカード領域に入っている間だけハイライト」の運用でOK
    setDragOverCardId((cur) => (cur === cardId ? null : cur));
  };

  /** 入力（動詞）変更 */
  const onActionChange = (cardId: number, value: string) => {
    setPlans((prev) => {
      const base = prev[cardId] ?? { person: null, action: '' };
      return { ...prev, [cardId]: { ...base, action: value } };
    });
  };

  /** 割当クリア（カードの人物だけ外す） */
  const clearPersonFromCard = (cardId: number) => {
    setPlans((prev) => {
      const base = prev[cardId] ?? { person: null, action: '' };
      return { ...prev, [cardId]: { ...base, person: null } };
    });
  };

  /** 次へ進むボタンの有効条件（カード0件なら常にtrue） */
  const nextEnabled = useMemo(() => {
    if (cards.length === 0) return true;
    return cards.every((c) => {
      const plan = plans[c.id];
      return plan && plan.person && plan.person.trim() && plan.action.trim();
    });
  }, [cards, plans]);

  return (
    <main className="flex-1 p-12 flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP5 関係性クラフティング</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">5/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          それぞれの仕事（ビフォースケッチ項目）ごとに、
          <strong>人物（誰に）</strong> と <strong>行動（何をする）</strong> を決めましょう。
          人物は右のパレットからカードへドラッグ＆ドロップ、行動はカード下の入力欄に「動詞（1文）」で記入します。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '71.0%' }}
          ></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-8 fade-in">
        {/* 左2カラム：クラフティング・マップ（旧デザイン寄せ） */}
        <div className="col-span-2 bg-slate-100 rounded-2xl p-6 overflow-y-auto">
          <h3 className="font-bold mb-4 text-slate-700">あなたのクラフティング・マップ</h3>

          {cards.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              STEP1で入力したデータがありません
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {cards.map((card) => {
                const tags = tagsByCard.get(card.id) ?? [];
                const plan = plans[card.id] ?? { person: null, action: '' };
                const isDragOver = dragOverCardId === card.id;

                return (
                  <div
                    key={card.id}
                    className={`bg-white rounded-lg p-4 shadow-sm transition ring-offset-2 ${
                      isDragOver ? 'ring-2 ring-orange-300' : ''
                    }`}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDropToCard(card.id, e)}
                    onDragEnter={onDragEnterCard(card.id)}
                    onDragLeave={onDragLeaveCard(card.id)}
                  >
                    {/* タスク名 & エネルギー */}
                    <p className="text-base font-semibold text-slate-800 break-words">
                      {card.content || '（未入力）'}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">エネルギー</span>
                        <span className="text-xs font-medium text-slate-800">
                          {card.energyPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${card.energyPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Step4 の紐づけ（タグ表示） */}
                    {tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((t, i) => (
                          <span
                            key={`${t.type}-${t.label}-${i}`}
                            className={`text-xs font-semibold py-1 px-2 rounded-full ${
                              t.type === 'motivation'
                                ? 'text-orange-600 bg-orange-200'
                                : 'text-amber-600 bg-amber-200'
                            }`}
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-slate-400">
                        （Step4でタグを紐づけると表示されます）
                      </div>
                    )}

                    {/* 下半分（人物＆動詞） */}
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      {/* 上段：人物（誰に） */}
                      <div className="flex items-center gap-2 mb-2">
                        {plan.person ? (
                          <>
                            <span className="text-xs font-semibold py-1 px-2 rounded-full text-white bg-teal-500">
                              {plan.person}
                            </span>
                            <button
                              type="button"
                              onClick={() => clearPersonFromCard(card.id)}
                              className="text-slate-400 hover:text-red-600 text-xs"
                              title="人物をクリア"
                              aria-label="人物をクリア"
                            >
                              ×
                            </button>
                            <span className="text-xs text-slate-400">がキーパーソン</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] text-slate-400">
                              （このカードに人物をドロップ）
                            </span>
                            <span className="text-xs text-slate-400">がキーパーソン</span>
                          </>
                        )}
                      </div>

                      {/* 下段：文の形「〇〇に、［動詞］」 */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-teal-600 min-w-[3em]">
                          {plan.person ? `${plan.person}に、` : '（人物）に、'}
                        </span>
                        <input
                          type="text"
                          value={plan.action}
                          onChange={(e) => onActionChange(card.id, e.target.value)}
                          className="flex-1 bg-transparent focus:outline-none border-b border-dashed border-slate-300 focus:border-teal-500 transition"
                          placeholder="例：もっと良いやり方を尋ねてみる／喜びそうなことを事前に調べておく…"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右1カラム：人物パレット（追加＆削除） */}
        <div className="flex flex-col space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">人物パレット</h3>
            <p className="text-sm text-slate-500">
              人物を追加して、左の<strong>カード</strong>へドラッグ＆ドロップしてください。
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPerson();
                  }
                }}
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none"
                placeholder="人物名を入力して追加"
              />
              <button
                type="button"
                onClick={addPerson}
                className="px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                追加
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {people.length === 0 ? (
                <p className="text-sm text-slate-400">
                  人物がありません。上の入力から追加してください。
                </p>
              ) : (
                people.map((p) => (
                  <div
                    key={p}
                    className="flex items-center justify-between gap-3 bg-teal-200 text-teal-800 py-2 px-3 rounded-lg shadow-sm"
                    draggable
                    onDragStart={onDragStart(p)}
                    title="ドラッグしてカードへドロップ"
                  >
                    <span className="font-semibold text-sm">{p}</span>
                    <button
                      type="button"
                      onClick={() => removePerson(p)}
                      className="text-teal-900/70 hover:text-red-700"
                      title="この人物を削除"
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
          onClick={() => navigate('/step4')}
          className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 transition-all"
        >
          前に戻る
        </button>
        <button
          onClick={() => navigate('/step6')}
          disabled={!nextEnabled}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          次へ進む
        </button>
      </footer>
    </main>
  );
};

export default Step5;

// frontend/src/pages/Step4.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** --- LocalStorage Keys (Step1/3/4で共通利用) --- */
const LS_STEP1_CARDS = 'step1-cards';
const LS_STEP3_M = 'step3SelectedMotivations';
const LS_STEP3_P = 'step3SelectedPreferences';
const LS_STEP4_ASSIGN = 'step4CardAssignments';

/** --- 型定義 --- */
type SelectionType = 'motivation' | 'preference';

type WorkCard = {
  id: number;
  content: string;
  energyPercentage: number;
};

type SelectedItem = {
  id: string; // "motivation:xxx" | "preference:xxx"
  type: SelectionType;
  label: string; // decodeURIComponentした素のラベル
};

type Assignment = {
  cardId: number;
  itemId: string; // SelectedItem.id
};

/** --- ユーティリティ --- */
const parseJSON = <T,>(raw: string | null, fallback: T): T => {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const toItemId = (type: SelectionType, label: string): string =>
  `${type}:${encodeURIComponent(label)}`;

/** Step3で保存された配列は以下どちらでも来る想定
 *  - ["motivation:%E6%A5%BD%E3%81%97%E3%81%95", "motivation:..."]
 *  - ["楽しさ", "成長する"]（型接頭辞なし）
 */
const decodeFromStep3 = (raw: string, fallback: SelectionType): SelectedItem | null => {
  if (!raw) return null;

  // "type:encoded" 形式
  const colon = raw.indexOf(':');
  if (colon >= 0) {
    const head = raw.slice(0, colon);
    const enc = raw.slice(colon + 1);
    const type: SelectionType = head === 'motivation' || head === 'preference' ? head : fallback;
    try {
      const label = decodeURIComponent(enc).trim();
      if (!label) return null;
      return {
        id: toItemId(type, label),
        type,
        label,
      };
    } catch {
      return null;
    }
  }

  // ラベル文字列だけの場合
  const label = raw.trim();
  if (!label) return null;
  return {
    id: toItemId(fallback, label),
    type: fallback,
    label,
  };
};

/** --- 本体 --- */
const Step4 = () => {
  const navigate = useNavigate();

  /** Step1のカード（ビフォースケッチ項目） */
  const [cards, setCards] = useState<WorkCard[]>([]);

  /** Step3の選択（パレット） */
  const [palette, setPalette] = useState<SelectedItem[]>([]);

  /** 割り当て（カードID × アイテムID）の配列
   *   同じ itemId を複数カードに割り当てOK
   *   ただし同一カードに同じ itemId は重複不可
   */
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    parseJSON<Assignment[]>(localStorage.getItem(LS_STEP4_ASSIGN), [])
  );

  /** 初期読込完了フラグ（これがtrueになるまで保存を抑止） */
  const [hydrated, setHydrated] = useState(false);

  /** 初期読込（Step1, Step3, Step4の順で復元） */
  useEffect(() => {
    // Step1
    const step1 = parseJSON<WorkCard[]>(localStorage.getItem(LS_STEP1_CARDS), []);
    setCards(step1);

    // Step3 -> パレット復元
    const mRaw = parseJSON<string[]>(localStorage.getItem(LS_STEP3_M), []);
    const pRaw = parseJSON<string[]>(localStorage.getItem(LS_STEP3_P), []);

    const items: SelectedItem[] = [];
    const seen = new Set<string>();

    mRaw.forEach((raw) => {
      const it = decodeFromStep3(raw, 'motivation');
      if (it && !seen.has(it.id)) {
        seen.add(it.id);
        items.push(it);
      }
    });
    pRaw.forEach((raw) => {
      const it = decodeFromStep3(raw, 'preference');
      if (it && !seen.has(it.id)) {
        seen.add(it.id);
        items.push(it);
      }
    });

    // 表示順：動機→嗜好、同タイプ内は日本語ソート
    items.sort((a, b) =>
      a.type === b.type ? a.label.localeCompare(b.label, 'ja') : a.type === 'motivation' ? -1 : 1
    );
    setPalette(items);

    // Step4 保存済み割当をロードし、存在するitemId/カードのみ残す
    const saved = parseJSON<Assignment[]>(localStorage.getItem(LS_STEP4_ASSIGN), []);
    const itemSet = new Set(items.map((i) => i.id));
    const cardSet = new Set(step1.map((c) => c.id));
    const filtered = saved.filter((a) => itemSet.has(a.itemId) && cardSet.has(a.cardId));
    setAssignments(filtered);

    // これで初期読込完了
    setHydrated(true);
  }, []);

  /** 保存（初期化後のみ実行） */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_STEP4_ASSIGN, JSON.stringify(assignments));
  }, [assignments, hydrated]);

  /** 参照用マップ */
  const paletteMap = useMemo(() => new Map(palette.map((it) => [it.id, it] as const)), [palette]);

  /** カードごとの割り当て辞書 { cardId: SelectedItem[] } */
  const assignedByCard = useMemo(() => {
    const map = new Map<number, SelectedItem[]>();
    assignments.forEach((a) => {
      const item = paletteMap.get(a.itemId);
      if (!item) return;
      const arr = map.get(a.cardId);
      if (arr) arr.push(item);
      else map.set(a.cardId, [item]);
    });

    // 見た目を安定させるためにタイプ/ラベルで整列
    map.forEach((arr) =>
      arr.sort((x, y) =>
        x.type === y.type ? x.label.localeCompare(y.label, 'ja') : x.type === 'motivation' ? -1 : 1
      )
    );
    return map;
  }, [assignments, paletteMap]);

  /** パレット → カードにドロップ */
  const onDropToCard = useCallback(
    (cardId: number, ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      const itemId = ev.dataTransfer.getData('text/plain');
      if (!itemId || !paletteMap.has(itemId)) return;

      // 同一カードに同じitemIdは不可
      const exists = assignments.some((a) => a.cardId === cardId && a.itemId === itemId);
      if (exists) return;

      setAssignments((prev) => [...prev, { cardId, itemId }]);
    },
    [assignments, paletteMap]
  );

  const onDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };

  /** パレットのドラッグ開始 */
  const onDragStart = (itemId: string) => (ev: React.DragEvent<HTMLDivElement>) => {
    ev.dataTransfer.setData('text/plain', itemId);
    ev.dataTransfer.effectAllowed = 'copyMove';
  };

  /** カード内チップ削除 */
  const removeAssigned = (cardId: number, itemId: string) => {
    setAssignments((prev) => prev.filter((a) => !(a.cardId === cardId && a.itemId === itemId)));
  };

  /** 全リセット */
  const resetAll = () => {
    setAssignments([]);
  };

  return (
    <main className="step-page step4 flex-1 p-12 flex flex-col">
      <header className="step-header mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold">STEP4 課題クラフティング</h2>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">4/7</span>
            <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center">
              ？
            </button>
          </div>
        </div>
        <p className="text-slate-500">
          ビフォースケッチの各項目（カード）に、あなたの「動機・嗜好」タグをドラッグ＆ドロップで結び付けましょう。
          同じタグは複数の項目に配置できますが、同じ項目に同じタグを重複配置することはできません。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-orange-600 h-2 rounded-full progress-bar-fill"
            style={{ width: '56.8%' }}
          />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-8 fade-in step-body">
        {/* 左2カラム：ビフォースケッチ（カード一覧） */}
        <section className="col-span-2 bg-slate-100 rounded-2xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">あなたのビフォースケッチ（STEP1）</h3>
            <button
              type="button"
              onClick={resetAll}
              className="text-sm text-slate-500 hover:text-red-600"
            >
              すべての割り当てをリセット
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              STEP1 のデータが見つかりません。STEP1で保存するとここに表示されます。
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {cards.map((card) => {
                const assigned = assignedByCard.get(card.id) ?? [];
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800 break-words">
                        {card.content || '（未入力）'}
                      </p>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500">エネルギー</div>
                        <div className="text-[11px] font-medium text-slate-800">
                          {card.energyPercentage}%
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                        style={{ width: `${card.energyPercentage}%` }}
                      />
                    </div>

                    {/* ドロップエリア：タグが増えれば自然に高さが伸びる */}
                    <div
                      className={`mt-4 rounded-lg border ${
                        assigned.length > 0
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-dashed border-slate-300 bg-slate-50'
                      } transition-all`}
                      onDragOver={onDragOver}
                      onDrop={(ev) => onDropToCard(card.id, ev)}
                    >
                      <div className="px-3 py-2 text-xs text-slate-500">
                        {assigned.length > 0 ? '配置済みのタグ' : 'ここにタグをドロップ'}
                      </div>

                      <div className="px-3 pb-3 flex flex-wrap gap-2">
                        {assigned.map((item) => (
                          <span
                            key={item.id}
                            className={`inline-flex items-center gap-2 text-xs font-semibold py-1.5 px-2.5 rounded-full shadow-sm ${
                              item.type === 'motivation'
                                ? 'text-orange-700 bg-orange-100'
                                : 'text-amber-700 bg-amber-100'
                            }`}
                          >
                            {item.label}
                            <button
                              type="button"
                              onClick={() => removeAssigned(card.id, item.id)}
                              className="text-slate-400 hover:text-red-600"
                              aria-label="このタグを削除"
                              title="このタグを削除"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {assigned.length === 0 && (
                          <div className="text-[11px] text-slate-400">
                            （ドラッグ＆ドロップで追加）
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 右1カラム：パレット */}
        <section className="selection-palette flex flex-col space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">あなたの動機・嗜好パレット</h3>
            <p className="text-sm text-slate-500">
              下のタグを、左の「ビフォースケッチ項目」へドラッグ＆ドロップで配置します。
              同じタグは複数の項目に使えます。
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-slate-700 mb-2">動機</h4>
            <div className="flex flex-wrap gap-2">
              {palette.filter((i) => i.type === 'motivation').length === 0 ? (
                <p className="text-sm text-slate-400">STEP3で動機を選択すると表示されます。</p>
              ) : (
                palette
                  .filter((i) => i.type === 'motivation')
                  .map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={onDragStart(item.id)}
                      className="cursor-move select-none inline-flex items-center text-xs font-semibold py-1.5 px-2.5 rounded-full bg-orange-200 text-orange-800 shadow-sm hover:brightness-95"
                      title="ドラッグして配置"
                    >
                      {item.label}
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-slate-700 mb-2">嗜好</h4>
            <div className="flex flex-wrap gap-2">
              {palette.filter((i) => i.type === 'preference').length === 0 ? (
                <p className="text-sm text-slate-400">STEP3で嗜好を選択すると表示されます。</p>
              ) : (
                palette
                  .filter((i) => i.type === 'preference')
                  .map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={onDragStart(item.id)}
                      className="cursor-move select-none inline-flex items-center text-xs font-semibold py-1.5 px-2.5 rounded-full bg-amber-200 text-amber-800 shadow-sm hover:brightness-95"
                      title="ドラッグして配置"
                    >
                      {item.label}
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/step3')}
          className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 transition-all"
        >
          前に戻る
        </button>
        <button
          type="button"
          onClick={() => navigate('/step5')}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-700 transition-all"
        >
          次へ進む
        </button>
      </footer>
    </main>
  );
};

export default Step4;

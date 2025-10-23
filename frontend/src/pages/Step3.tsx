import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createMotivationMaster,
  createPreferenceMaster,
  fetchMotivationMasters,
  fetchPreferenceMasters,
} from '../lib-step3-4/api';
import type { MotivationMaster, PreferenceMaster, SelectionType } from '../lib-step3-4/types';

const USER_ID = 1;
const MAX_LABEL_LENGTH = 60;
const MAX_SELECTIONS_PER_TYPE = 4;

const LS_STEP3_M = 'step3SelectedMotivations';
const LS_STEP3_P = 'step3SelectedPreferences';

const toItemId = (type: SelectionType, label: string) => `${type}:${encodeURIComponent(label)}`;

const fromStorage = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

const saveToStorage = (key: string, values: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {}
};

const normalize = (values: string[], type: SelectionType): string[] => {
  const s = new Set<string>();
  values.forEach((v) => {
    if (typeof v !== 'string') return;
    if (v.startsWith(`${type}:`)) {
      s.add(v);
      return;
    }
    const t = v.trim();
    if (t) s.add(toItemId(type, t));
  });
  return [...s];
};

const toErr = (e: unknown) => (e instanceof Error ? e.message : 'エラーが発生しました');

const Step3 = () => {
  const navigate = useNavigate();

  const [beforeSketchCards, setBeforeSketchCards] = useState<
    { id: number; content: string; energyPercentage: number }[]
  >([]);

  const [motivations, setMotivations] = useState<MotivationMaster[]>([]);
  const [preferences, setPreferences] = useState<PreferenceMaster[]>([]);

  const [selectedM, setSelectedM] = useState<string[]>(() =>
    normalize(fromStorage(LS_STEP3_M), 'motivation').slice(0, MAX_SELECTIONS_PER_TYPE)
  );
  const [selectedP, setSelectedP] = useState<string[]>(() =>
    normalize(fromStorage(LS_STEP3_P), 'preference').slice(0, MAX_SELECTIONS_PER_TYPE)
  );

  const [minput, setMinput] = useState('');
  const [pinput, setPinput] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mError, setMError] = useState<string | null>(null);
  const [pError, setPError] = useState<string | null>(null);
  const [creating, setCreating] = useState<SelectionType | null>(null);

  // Step1 のカード（プレビュー用）
  useEffect(() => {
    try {
      const raw = localStorage.getItem('step1-cards');
      setBeforeSketchCards(raw ? JSON.parse(raw) : []);
    } catch {
      setBeforeSketchCards([]);
    }
  }, []);

  // 保存
  useEffect(() => {
    saveToStorage(LS_STEP3_M, selectedM);
  }, [selectedM]);
  useEffect(() => {
    saveToStorage(LS_STEP3_P, selectedP);
  }, [selectedP]);

  const loadMasters = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [mm, pm] = await Promise.all([
        fetchMotivationMasters(USER_ID),
        fetchPreferenceMasters(USER_ID),
      ]);
      setMotivations(mm);
      setPreferences(pm);
    } catch (e) {
      setFetchError(toErr(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMasters();
  }, [loadMasters]);

  const mNames = useMemo(() => motivations.map((i) => i.name), [motivations]);
  const pNames = useMemo(() => preferences.map((i) => i.name), [preferences]);

  const toggle = (type: SelectionType, label: string) => {
    const t = label.trim();
    if (!t) return;
    const id = toItemId(type, t);
    if (type === 'motivation') {
      setSelectedM((prev) => {
        const on = prev.includes(id);
        if (on) {
          if (prev.length <= MAX_SELECTIONS_PER_TYPE) setMError(null);
          return prev.filter((v) => v !== id);
        }
        if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
          setMError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
          return prev;
        }
        setMError(null);
        return [...prev, id];
      });
    } else {
      setSelectedP((prev) => {
        const on = prev.includes(id);
        if (on) {
          if (prev.length <= MAX_SELECTIONS_PER_TYPE) setPError(null);
          return prev.filter((v) => v !== id);
        }
        if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
          setPError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
          return prev;
        }
        setPError(null);
        return [...prev, id];
      });
    }
  };

  const handleCreate = async (type: SelectionType) => {
    const v = (type === 'motivation' ? minput : pinput).trim();
    if (!v) {
      type === 'motivation'
        ? setMError('内容を入力してください。')
        : setPError('内容を入力してください。');
      return;
    }
    if (v.length > MAX_LABEL_LENGTH) {
      const msg = `最大${MAX_LABEL_LENGTH}文字までです。`;
      type === 'motivation' ? setMError(msg) : setPError(msg);
      return;
    }
    setCreating(type);
    setMError(null);
    setPError(null);
    try {
      if (type === 'motivation') {
        const created = await createMotivationMaster(USER_ID, v);
        setMinput('');
        const id = toItemId('motivation', created.name.trim());
        setSelectedM((prev) => {
          if (prev.includes(id)) return prev;
          if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
            setMError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
            return prev;
          }
          return [...prev, id];
        });
      } else {
        const created = await createPreferenceMaster(USER_ID, v);
        setPinput('');
        const id = toItemId('preference', created.name.trim());
        setSelectedP((prev) => {
          if (prev.includes(id)) return prev;
          if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
            setPError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
            return prev;
          }
          return [...prev, id];
        });
      }
      await loadMasters();
    } catch (e) {
      (type === 'motivation' ? setMError : setPError)(toErr(e));
    } finally {
      setCreating(null);
    }
  };

  const nextEnabled = selectedM.length > 0 || selectedP.length > 0;

  return (
    <main className="step-page step3 flex-1 p-12 flex flex-col">
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
          あなたの仕事の原動力となる価値観を選びましょう（各3〜4個目安）。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '42.6%' }} />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-8 fade-in">
        {/* 左：Step1プレビュー（カード） */}
        <section className="bg-slate-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold mb-4 text-slate-700">あなたのビフォースケッチ（STEP1）</h3>
          {beforeSketchCards.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              STEP1で保存するとここに表示されます。
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto auto-rows-max">
              {beforeSketchCards.map((card) => (
                <div key={card.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm font-medium text-slate-800 mb-2 break-words">
                    {card.content || '（未入力）'}
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">エネルギー</span>
                      <span className="text-xs font-medium text-slate-800">
                        {card.energyPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                        style={{ width: `${card.energyPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 右：選択＆カスタム追加 */}
        <section className="flex flex-col space-y-8 overflow-y-auto pr-1">
          {fetchError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {fetchError}
            </div>
          )}

          {/* 動機 */}
          <article className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">動機</h3>
              <span className="text-sm text-slate-500">{selectedM.length}件選択中</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              仕事を通じて、どのような価値観を達成したいですか？
            </p>
            <div className="flex flex-wrap gap-3">
              {loading && mNames.length === 0 && (
                <span className="text-sm text-slate-400">読み込み中...</span>
              )}
              {mNames.map((name) => {
                const label = name.trim();
                const id = toItemId('motivation', label);
                const on = selectedM.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle('motivation', label)}
                    className={`py-2 px-4 rounded-full border transition ${
                      on
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={minput}
                onChange={(e) => setMinput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleCreate('motivation');
                  }
                }}
                placeholder="カスタムで動機を追加..."
                maxLength={MAX_LABEL_LENGTH}
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void handleCreate('motivation')}
                disabled={creating === 'motivation'}
                className="px-5 bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-60 hover:bg-orange-700"
              >
                追加
              </button>
            </div>
            {mError && <p className="text-sm text-red-600 mt-2">{mError}</p>}
          </article>

          {/* 嗜好 */}
          <article className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">嗜好</h3>
              <span className="text-sm text-slate-500">{selectedP.length}件選択中</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              どのような能力やスキルを発揮したいですか？
            </p>
            <div className="flex flex-wrap gap-3">
              {loading && pNames.length === 0 && (
                <span className="text-sm text-slate-400">読み込み中...</span>
              )}
              {pNames.map((name) => {
                const label = name.trim();
                const id = toItemId('preference', label);
                const on = selectedP.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle('preference', label)}
                    className={`py-2 px-4 rounded-full border transition ${
                      on
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={pinput}
                onChange={(e) => setPinput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleCreate('preference');
                  }
                }}
                placeholder="カスタムで嗜好を追加..."
                maxLength={MAX_LABEL_LENGTH}
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void handleCreate('preference')}
                disabled={creating === 'preference'}
                className="px-5 bg-amber-500 text-white rounded-lg font-semibold disabled:opacity-60 hover:bg-amber-600"
              >
                追加
              </button>
            </div>
            {pError && <p className="text-sm text-red-600 mt-2">{pError}</p>}
          </article>
        </section>
      </div>

      <footer className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/step2')}
          className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 transition-all"
        >
          前に戻る
        </button>
        <button
          type="button"
          onClick={() => navigate('/step4')}
          disabled={!nextEnabled}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          次へ進む
        </button>
      </footer>
    </main>
  );
};

export default Step3;

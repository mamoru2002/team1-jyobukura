import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchBeforeSketchDataUrl,
  createMotivationMaster,
  createPreferenceMaster,
  fetchMotivationMasters,
  fetchPreferenceMasters,
} from '../lib-step3-4/api';
import type { MotivationMaster, PreferenceMaster, SelectionType } from '../lib-step3-4/types';
import { resolveActiveUserId, cacheActiveUserId } from '../lib-step3-4/user';

const MAX_LABEL_LENGTH = 60;
const STORAGE_KEY_MOTIVATIONS = 'step3SelectedMotivations';
const STORAGE_KEY_PREFERENCES = 'step3SelectedPreferences';
const MAX_SELECTIONS_PER_TYPE = 4;

const toItemId = (type: SelectionType, label: string): string => `${type}:${encodeURIComponent(label)}`;

const fromStorage = (key: string): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch (error) {
    console.error('Failed to parse selection storage', error);
    return [];
  }
};

const saveToStorage = (key: string, values: string[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch (error) {
    console.error('Failed to persist selection', error);
  }
};

const normalizeSelection = (values: string[], type: SelectionType): string[] => {
  const normalized = new Set<string>();
  values.forEach((value) => {
    if (typeof value !== 'string') {
      return;
    }
    if (value.startsWith(`${type}:`)) {
      normalized.add(value);
      return;
    }
    const trimmed = value.trim();
    if (trimmed) {
      normalized.add(toItemId(type, trimmed));
    }
  });
  return Array.from(normalized);
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '不明なエラーが発生しました。';
};

const Step3 = () => {
  const navigate = useNavigate();
  const [userId] = useState(() => {
    const resolved = resolveActiveUserId();
    cacheActiveUserId(resolved);
    return resolved;
  });
  const [beforeSketchUrl, setBeforeSketchUrl] = useState<string | null>(null);
  const [motivations, setMotivations] = useState<MotivationMaster[]>([]);
  const [preferences, setPreferences] = useState<PreferenceMaster[]>([]);
  const [selectedMotivationIds, setSelectedMotivationIds] = useState<string[]>(() =>
    normalizeSelection(fromStorage(STORAGE_KEY_MOTIVATIONS), 'motivation').slice(
      0,
      MAX_SELECTIONS_PER_TYPE
    )
  );
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<string[]>(() =>
    normalizeSelection(fromStorage(STORAGE_KEY_PREFERENCES), 'preference').slice(
      0,
      MAX_SELECTIONS_PER_TYPE
    )
  );
  const [motivationInput, setMotivationInput] = useState('');
  const [preferenceInput, setPreferenceInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [motivationError, setMotivationError] = useState<string | null>(null);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const [creatingType, setCreatingType] = useState<SelectionType | null>(null);
  const [beforeSketchError, setBeforeSketchError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadSketch = async () => {
      setBeforeSketchError(null);
      try {
        const remoteUrl = await fetchBeforeSketchDataUrl(userId);
        if (!isActive) {
          return;
        }

        if (remoteUrl) {
          setBeforeSketchUrl(remoteUrl);
          cacheActiveUserId(userId);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('beforeSketchDataUrl', remoteUrl);
          }
        } else if (typeof window !== 'undefined') {
          const fallback = window.localStorage.getItem('beforeSketchDataUrl');
          setBeforeSketchUrl(fallback);
        } else {
          setBeforeSketchUrl(null);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        setBeforeSketchError(toErrorMessage(error));
        if (typeof window !== 'undefined') {
          const fallback = window.localStorage.getItem('beforeSketchDataUrl');
          setBeforeSketchUrl(fallback);
        }
      }
    };

    void loadSketch();

    return () => {
      isActive = false;
    };
  }, [userId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_MOTIVATIONS, selectedMotivationIds);
  }, [selectedMotivationIds]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_PREFERENCES, selectedPreferenceIds);
  }, [selectedPreferenceIds]);

  const loadMasters = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }
      setFetchError(null);
      try {
        const [motivationList, preferenceList] = await Promise.all([
          fetchMotivationMasters(userId),
          fetchPreferenceMasters(userId),
        ]);
        setMotivations(motivationList);
        setPreferences(preferenceList);
      } catch (error) {
        setFetchError(toErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    void loadMasters();
  }, [loadMasters]);

  const motivationNames = useMemo(() => motivations.map((item) => item.name), [motivations]);
  const preferenceNames = useMemo(() => preferences.map((item) => item.name), [preferences]);

  const toggleSelection = (type: SelectionType, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }
    const itemId = toItemId(type, trimmed);
    if (type === 'motivation') {
      setSelectedMotivationIds((prev) => {
        const isSelected = prev.includes(itemId);
        if (isSelected) {
          if (prev.length <= MAX_SELECTIONS_PER_TYPE) {
            setMotivationError(null);
          }
          return prev.filter((value) => value !== itemId);
        }
        if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
          setMotivationError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
          return prev;
        }
        setMotivationError(null);
        return [...prev, itemId];
      });
    } else {
      setSelectedPreferenceIds((prev) => {
        const isSelected = prev.includes(itemId);
        if (isSelected) {
          if (prev.length <= MAX_SELECTIONS_PER_TYPE) {
            setPreferenceError(null);
          }
          return prev.filter((value) => value !== itemId);
        }
        if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
          setPreferenceError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
          return prev;
        }
        setPreferenceError(null);
        return [...prev, itemId];
      });
    }
  };

  const handleCreate = async (type: SelectionType) => {
    const value = (type === 'motivation' ? motivationInput : preferenceInput).trim();
    if (!value) {
      if (type === 'motivation') {
        setMotivationError('内容を入力してください。');
      } else {
        setPreferenceError('内容を入力してください。');
      }
      return;
    }
    if (value.length > MAX_LABEL_LENGTH) {
      const message = `最大${MAX_LABEL_LENGTH}文字までです。`;
      if (type === 'motivation') {
        setMotivationError(message);
      } else {
        setPreferenceError(message);
      }
      return;
    }

    setCreatingType(type);
    if (type === 'motivation') {
      setMotivationError(null);
    } else {
      setPreferenceError(null);
    }
    try {
      if (type === 'motivation') {
        const created = await createMotivationMaster(userId, value);
        setMotivationInput('');
        const createdId = toItemId('motivation', created.name.trim());
        setSelectedMotivationIds((prev) => {
          if (prev.includes(createdId)) {
            return prev;
          }
          if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
            setMotivationError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
            return prev;
          }
          setMotivationError(null);
          return [...prev, createdId];
        });
      } else {
        const created = await createPreferenceMaster(userId, value);
        setPreferenceInput('');
        const createdId = toItemId('preference', created.name.trim());
        setSelectedPreferenceIds((prev) => {
          if (prev.includes(createdId)) {
            return prev;
          }
          if (prev.length >= MAX_SELECTIONS_PER_TYPE) {
            setPreferenceError(`最大${MAX_SELECTIONS_PER_TYPE}件まで選択できます。`);
            return prev;
          }
          setPreferenceError(null);
          return [...prev, createdId];
        });
      }
      await loadMasters(false);
    } catch (error) {
      const message = toErrorMessage(error);
      if (type === 'motivation') {
        setMotivationError(message);
      } else {
        setPreferenceError(message);
      }
    } finally {
      setCreatingType(null);
    }
  };

  const isNextEnabled = selectedMotivationIds.length > 0 || selectedPreferenceIds.length > 0;

  return (
    <main className="step-page step3 flex-1 p-12 flex flex-col">
      <header className="step-header mb-8">
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
          <div className="bg-orange-600 h-2 rounded-full progress-bar-fill" style={{ width: '42.6%' }}></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-8 fade-in step-body">
        <section className="sketch-preview bg-slate-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold mb-4 text-slate-700">あなたのビフォースケッチ（STEP1）</h3>
          <div className="sketch-preview-frame flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
            {beforeSketchUrl ? (
              <img src={beforeSketchUrl} alt="Before sketch" className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-slate-400 text-sm text-center px-4">
                ビフォースケッチが見つかりません。STEP1で保存するとここに表示されます。
              </p>
            )}
          </div>
          {beforeSketchError ? (
            <p className="text-xs text-red-600 mt-3 text-center">{beforeSketchError}</p>
          ) : null}
        </section>

        <section className="selection-area flex flex-col space-y-8 overflow-y-auto pr-1">
          {fetchError ? (
            <div className="selection-error text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {fetchError}
            </div>
          ) : null}
          <article className="selection-panel bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">動機</h3>
              <span className="selection-count text-sm text-slate-500">
                {selectedMotivationIds.length}件選択中
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              仕事を通じて、どのような価値観を達成したいですか？
            </p>
            <div className="selection-options flex flex-wrap gap-3">
              {loading && motivationNames.length === 0 ? (
                <span className="text-sm text-slate-400">読み込み中...</span>
              ) : null}
              {motivationNames.map((name) => {
                const trimmed = name.trim();
                const itemId = toItemId('motivation', trimmed);
                const isSelected = selectedMotivationIds.includes(itemId);
                return (
                  <button
                    type="button"
                    key={itemId}
                    onClick={() => toggleSelection('motivation', trimmed)}
                    className={`selection-option py-2 px-4 rounded-full border transition ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {trimmed}
                  </button>
                );
              })}
            </div>
            <div className="selection-form mt-4 flex gap-2">
              <input
                type="text"
                value={motivationInput}
                onChange={(event) => setMotivationInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
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
                disabled={creatingType === 'motivation'}
                className="px-5 bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-orange-700"
              >
                追加
              </button>
            </div>
            {motivationError ? (
              <p className="text-sm text-red-600 mt-2">{motivationError}</p>
            ) : null}
          </article>

          <article className="selection-panel bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">嗜好</h3>
              <span className="selection-count text-sm text-slate-500">
                {selectedPreferenceIds.length}件選択中
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              仕事を通じて、どのような能力やスキルを発揮したいですか？
            </p>
            <div className="selection-options flex flex-wrap gap-3">
              {loading && preferenceNames.length === 0 ? (
                <span className="text-sm text-slate-400">読み込み中...</span>
              ) : null}
              {preferenceNames.map((name) => {
                const trimmed = name.trim();
                const itemId = toItemId('preference', trimmed);
                const isSelected = selectedPreferenceIds.includes(itemId);
                return (
                  <button
                    type="button"
                    key={itemId}
                    onClick={() => toggleSelection('preference', trimmed)}
                    className={`selection-option py-2 px-4 rounded-full border transition ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {trimmed}
                  </button>
                );
              })}
            </div>
            <div className="selection-form mt-4 flex gap-2">
              <input
                type="text"
                value={preferenceInput}
                onChange={(event) => setPreferenceInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
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
                disabled={creatingType === 'preference'}
                className="px-5 bg-amber-500 text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-600"
              >
                追加
              </button>
            </div>
            {preferenceError ? (
              <p className="text-sm text-red-600 mt-2">{preferenceError}</p>
            ) : null}
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
          disabled={!isNextEnabled}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          次へ進む
        </button>
      </footer>
    </main>
  );
};

export default Step3;

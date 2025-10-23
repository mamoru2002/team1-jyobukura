import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Placement, SelectedItem, SelectionType } from '../lib-step3-4/types';

const STORAGE_KEY_MOTIVATIONS = 'step3SelectedMotivations';
const STORAGE_KEY_PREFERENCES = 'step3SelectedPreferences';
const STORAGE_KEY_PLACEMENTS = 'step4Placements';

const clamp01 = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};

const toItemId = (type: SelectionType, label: string): string => `${type}:${encodeURIComponent(label)}`;

const parseStringArray = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch (error) {
    console.error('Failed to parse stored selection', error);
    return [];
  }
};

const decodeSelectedItem = (rawId: string, fallbackType: SelectionType): SelectedItem | null => {
  if (typeof rawId !== 'string' || rawId.length === 0) {
    return null;
  }
  if (!rawId.includes(':')) {
    const label = rawId.trim();
    if (!label) {
      return null;
    }
    const id = toItemId(fallbackType, label);
    return { id, type: fallbackType, label };
  }
  const [rawType, ...rest] = rawId.split(':');
  const encodedLabel = rest.join(':');
  const resolvedType: SelectionType = rawType === 'motivation' || rawType === 'preference' ? rawType : fallbackType;
  if (!encodedLabel) {
    return null;
  }
  try {
    const label = decodeURIComponent(encodedLabel).trim();
    if (!label) {
      return null;
    }
    const id = toItemId(resolvedType, label);
    return { id, type: resolvedType, label };
  } catch (error) {
    console.error('Failed to decode selection label', error);
    return null;
  }
};

const loadSelectedItems = (): SelectedItem[] => {
  const motivationIds = parseStringArray(localStorage.getItem(STORAGE_KEY_MOTIVATIONS));
  const preferenceIds = parseStringArray(localStorage.getItem(STORAGE_KEY_PREFERENCES));
  const results: SelectedItem[] = [];
  const seen = new Set<string>();

  const pushItem = (item: SelectedItem | null) => {
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      results.push(item);
    }
  };

  motivationIds.forEach((raw) => pushItem(decodeSelectedItem(raw, 'motivation')));
  preferenceIds.forEach((raw) => pushItem(decodeSelectedItem(raw, 'preference')));

  return results;
};

const isPlacement = (value: unknown): value is Placement => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.itemId === 'string' &&
    typeof record.x === 'number' &&
    typeof record.y === 'number'
  );
};

const loadPlacementsFromStorage = (validIds: Set<string>): Placement[] => {
  const stored = localStorage.getItem(STORAGE_KEY_PLACEMENTS);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(isPlacement)
      .map<Placement>((placement) => ({
        id: placement.id,
        itemId: placement.itemId,
        x: clamp01(placement.x),
        y: clamp01(placement.y),
      }))
      .filter((placement) => validIds.has(placement.itemId));
  } catch (error) {
    console.error('Failed to parse placements', error);
    return [];
  }
};

const Step4 = () => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [beforeSketchUrl, setBeforeSketchUrl] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [highlightedPlacementId, setHighlightedPlacementId] = useState<string | null>(null);
  const [draggingPlacement, setDraggingPlacement] = useState<{ placementId: string; pointerId: number } | null>(null);

  useEffect(() => {
    const url = localStorage.getItem('beforeSketchDataUrl');
    if (url) {
      setBeforeSketchUrl(url);
    }
    const items = loadSelectedItems();
    setSelectedItems(items);
    const validIds = new Set(items.map((item) => item.id));
    setPlacements(loadPlacementsFromStorage(validIds));
  }, []);

  const itemMap = useMemo(() => new Map(selectedItems.map((item) => [item.id, item])), [selectedItems]);

  useEffect(() => {
    setPlacements((prev) => {
      const filtered = prev.filter((placement) => itemMap.has(placement.itemId));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [itemMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLACEMENTS, JSON.stringify(placements));
    } catch (error) {
      console.error('Failed to persist placements', error);
    }
  }, [placements]);

  useEffect(() => {
    if (!highlightedPlacementId) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setHighlightedPlacementId(null);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [highlightedPlacementId]);

  const motivationItems = useMemo(
    () => selectedItems.filter((item) => item.type === 'motivation'),
    [selectedItems]
  );
  const preferenceItems = useMemo(
    () => selectedItems.filter((item) => item.type === 'preference'),
    [selectedItems]
  );

  const handleDragStart = (itemId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!overlayRef.current) {
      return;
    }
    const itemId = event.dataTransfer.getData('text/plain');
    if (!itemId || !itemMap.has(itemId)) {
      return;
    }
    const existing = placements.find((placement) => placement.itemId === itemId);
    if (existing) {
      setHighlightedPlacementId(existing.id);
      return;
    }
    const rect = overlayRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);
    const newPlacement: Placement = {
      id: `${itemId}::${Date.now()}`,
      itemId,
      x,
      y,
    };
    setPlacements((prev) => [...prev, newPlacement]);
    setHighlightedPlacementId(newPlacement.id);
  };

  const handlePlacementPointerDown = (placementId: string) => (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!overlayRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingPlacement({ placementId, pointerId: event.pointerId });
    setHighlightedPlacementId(placementId);
  };

  const handlePlacementPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!overlayRef.current || !draggingPlacement || draggingPlacement.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    const rect = overlayRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);
    setPlacements((prev) =>
      prev.map((placement) =>
        placement.id === draggingPlacement.placementId ? { ...placement, x, y } : placement
      )
    );
  };

  const finishPlacementDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingPlacement && draggingPlacement.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setDraggingPlacement(null);
    }
  };

  const removePlacement = (placementId: string) => {
    setPlacements((prev) => prev.filter((placement) => placement.id !== placementId));
  };

  const locatePlacement = (placementId: string) => {
    setHighlightedPlacementId(placementId);
    const element = overlayRef.current?.querySelector<HTMLDivElement>(
      `[data-placement-id="${placementId}"]`
    );
    element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  };

  const resetPlacements = () => {
    setPlacements([]);
  };

  const placementsByItemId = useMemo(() => {
    const map = new Map<string, Placement>();
    placements.forEach((placement) => {
      if (!map.has(placement.itemId)) {
        map.set(placement.itemId, placement);
      }
    });
    return map;
  }, [placements]);

  const renderCard = (item: SelectedItem) => {
    const placement = placementsByItemId.get(item.id);
    const isPlaced = Boolean(placement);
    return (
      <div
        key={item.id}
        className={`selection-chip rounded-lg py-2 px-4 shadow-sm flex items-center justify-between gap-3 ${
          item.type === 'motivation'
            ? 'bg-orange-200 text-orange-800'
            : 'bg-amber-200 text-amber-800'
        } ${isPlaced ? 'opacity-60 cursor-not-allowed' : 'cursor-move hover:brightness-95'}`}
        draggable={!isPlaced}
        onDragStart={handleDragStart(item.id)}
      >
        <span className="text-sm font-semibold">{item.label}</span>
        {!isPlaced ? <span className="text-xs text-slate-500">ドラッグ</span> : <span className="text-xs text-slate-400">配置済み</span>}
      </div>
    );
  };

  const formatPosition = (value: number): string => `${Math.round(value * 100)}%`;

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
          あなたの「動機・嗜好」を仕事に結びつけ、仕事の捉え方を変えてみましょう。
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div className="bg-orange-600 h-2 rounded-full progress-bar-fill" style={{ width: '56.8%' }}></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-8 fade-in step-body">
        <section className="sketch-workspace col-span-2 bg-slate-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold mb-4 text-slate-700">あなたのビフォースケッチ（STEP1）</h3>
          <div className="sketch-canvas relative flex-1 rounded-xl overflow-hidden border border-slate-200 bg-white">
            {beforeSketchUrl ? (
              <>
                <img
                  src={beforeSketchUrl}
                  alt="Before sketch"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div
                  ref={overlayRef}
                  className="sketch-overlay absolute inset-0"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {placements.map((placement) => {
                    const item = itemMap.get(placement.itemId);
                    if (!item) {
                      return null;
                    }
                    const isHighlighted = highlightedPlacementId === placement.id;
                    const isDragging = draggingPlacement?.placementId === placement.id;
                    return (
                      <div
                        key={placement.id}
                        data-placement-id={placement.id}
                        className={`sketch-label absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-lg shadow-md text-sm font-semibold transition ${
                          item.type === 'motivation'
                            ? 'bg-orange-500 text-white'
                            : 'bg-amber-500 text-white'
                        } ${isHighlighted ? 'ring-4 ring-offset-2 ring-orange-300' : ''} ${
                          isDragging ? 'opacity-80 scale-105' : ''
                        }`}
                        style={{ left: `${placement.x * 100}%`, top: `${placement.y * 100}%` }}
                        onPointerDown={handlePlacementPointerDown(placement.id)}
                        onPointerMove={handlePlacementPointerMove}
                        onPointerUp={finishPlacementDrag}
                        onPointerCancel={finishPlacementDrag}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm text-center px-6">
                ビフォースケッチが見つかりません。STEP1で保存するとここに表示されます。
              </div>
            )}
          </div>
        </section>

        <section className="selection-palette flex flex-col space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">あなたの動機・嗜好パレット</h3>
            <p className="text-sm text-slate-500">
              右のタグを左のビフォースケッチへドラッグ＆ドロップして配置しましょう。
            </p>
          </div>
          <div className="palette-section">
            <h4 className="font-semibold text-slate-600 mb-2">動機</h4>
            <div className="flex flex-col gap-3">
              {motivationItems.length === 0 ? (
                <p className="text-sm text-slate-400">STEP3で動機を選択するとここに表示されます。</p>
              ) : (
                motivationItems.map((item) => renderCard(item))
              )}
            </div>
          </div>
          <div className="palette-section">
            <h4 className="font-semibold text-slate-600 mb-2">嗜好</h4>
            <div className="flex flex-col gap-3">
              {preferenceItems.length === 0 ? (
                <p className="text-sm text-slate-400">STEP3で嗜好を選択するとここに表示されます。</p>
              ) : (
                preferenceItems.map((item) => renderCard(item))
              )}
            </div>
          </div>
          <div className="placed-list bg-white rounded-2xl p-5 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-700">配置済みのタグ</h4>
              <button
                type="button"
                onClick={resetPlacements}
                className="text-sm text-slate-500 hover:text-red-600"
              >
                すべてリセット
              </button>
            </div>
            {placements.length === 0 ? (
              <p className="text-sm text-slate-400 flex-1 flex items-center">
                まだ配置されていません。タグをドラッグして配置してみましょう。
              </p>
            ) : (
              <ul className="space-y-3 overflow-y-auto pr-1">
                {placements.map((placement) => {
                  const item = itemMap.get(placement.itemId);
                  if (!item) {
                    return null;
                  }
                  return (
                    <li key={placement.id} className="flex items-start justify-between gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">
                          位置: X {formatPosition(placement.x)} / Y {formatPosition(placement.y)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => locatePlacement(placement.id)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                        >
                          位置を表示
                        </button>
                        <button
                          type="button"
                          onClick={() => removePlacement(placement.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          削除
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
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

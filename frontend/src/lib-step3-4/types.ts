export type MotivationMaster = {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
};

export type PreferenceMaster = {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
};

export type SelectionType = 'motivation' | 'preference';

export type Placement = {
  id: string; // `${type}:${encodeURIComponent(label)}::${timestamp}`
  itemId: string; // `${type}:${encodeURIComponent(label)}`
  x: number; // 0..1
  y: number; // 0..1
};

export type SelectedItem = {
  id: string; // `${type}:${encodeURIComponent(label)}`
  type: SelectionType;
  label: string;
};

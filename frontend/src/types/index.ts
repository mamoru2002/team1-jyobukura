export interface User {
  id: number;
  email: string;
  name: string;
  timezone: string;
  level: number;
  experience_points: number;
  xp_to_next_level: number;
  xp_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface WorkItem {
  id: number;
  user_id: number;
  name: string;
  energy_percentage: number;
  reframe?: string;
  motivations: Array<{ id: number; name: string }>;
  preferences: Array<{ id: number; name: string }>;
  people: Array<{ id: number; name: string; role?: string }>;
  role_categories: Array<{ id: number; name: string }>;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: number;
  name: string;
  description?: string;
  due_date?: string;
  period_type?: string;
  status: '未着手' | '進行中' | '完了' | '取下げ';
  action_type: 'タスク' | 'クエスト';
  xp_points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  quest_type?: 'one_time' | 'recurring';
  work_item_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ActionPlan {
  id: number;
  user_id: number;
  next_actions: string;
  collaborators?: string;
  obstacles_and_solutions?: string;
  created_at: string;
  updated_at: string;
}

export interface Reflection {
  id: number;
  user_id: number;
  question1_change: string;
  question2_emotion_reason: string;
  question3_surprise: string;
  created_at: string;
  updated_at: string;
}

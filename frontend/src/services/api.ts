import axios from 'axios';
import type { User, WorkItem, Action, ActionPlan, Reflection } from '../types';

const API_BASE_URL = 'http://localhost:8001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users
export const getUser = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getDashboard = async (userId: number) => {
  const response = await api.get(`/users/${userId}/dashboard`);
  return response.data;
};

// Actions (Quests/Tasks)
export const getActions = async (userId: number): Promise<Action[]> => {
  const response = await api.get(`/actions?user_id=${userId}`);
  return response.data;
};

export const createAction = async (action: Partial<Action>): Promise<Action> => {
  const response = await api.post('/actions', { action });
  return response.data;
};

export const updateAction = async (id: number, action: Partial<Action>): Promise<Action> => {
  const response = await api.put(`/actions/${id}`, { action });
  return response.data;
};

export const deleteAction = async (id: number): Promise<void> => {
  await api.delete(`/actions/${id}`);
};

export const completeAction = async (id: number) => {
  const response = await api.post(`/actions/${id}/complete`);
  return response.data;
};

// Work Items
export const getWorkItems = async (userId: number): Promise<WorkItem[]> => {
  const response = await api.get(`/work_items?user_id=${userId}`);
  return response.data;
};

// Action Plans
export const getActionPlan = async (userId: number): Promise<ActionPlan> => {
  const response = await api.get(`/action_plans/${userId}`);
  return response.data;
};

export const createActionPlan = async (actionPlan: Partial<ActionPlan>): Promise<ActionPlan> => {
  const response = await api.post('/action_plans', { action_plan: actionPlan });
  return response.data;
};

export const updateActionPlan = async (
  userId: number,
  actionPlan: Partial<ActionPlan>
): Promise<ActionPlan> => {
  const response = await api.put(`/action_plans/${userId}`, { action_plan: actionPlan });
  return response.data;
};

// Reflections
export const getReflection = async (userId: number): Promise<Reflection> => {
  const response = await api.get(`/reflections/${userId}`);
  return response.data;
};

export const createReflection = async (reflection: Partial<Reflection>): Promise<Reflection> => {
  const response = await api.post('/reflections', { reflection });
  return response.data;
};

export default api;

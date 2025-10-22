import type { BeforeSketchPayload, MotivationMaster, PreferenceMaster } from './types';

const rawBaseUrl = import.meta.env.VITE_API_URL;
if (!rawBaseUrl) {
  throw new Error('VITE_API_URL is not defined');
}

const API_BASE = rawBaseUrl.replace(/\/+$/, '');

type JsonRecord = Record<string, unknown>;

const parseErrorMessage = async (response: Response): Promise<string> => {
  let message = `Request failed with status ${response.status}`;
  try {
    const data = await response.clone().json();
    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object') {
      const record = data as JsonRecord;
      if (typeof record.message === 'string' && record.message.trim().length > 0) {
        message = record.message;
      } else if (typeof record.error === 'string' && record.error.trim().length > 0) {
        message = record.error;
      } else if (record.errors && typeof record.errors === 'object') {
        const values = Object.values(record.errors as JsonRecord).flat();
        const first = values.find((value) => typeof value === 'string');
        if (typeof first === 'string' && first.trim().length > 0) {
          message = first;
        }
      }
    }
  } catch (jsonError) {
    try {
      const text = await response.clone().text();
      if (text.trim().length > 0) {
        message = text;
      }
    } catch (textError) {
      console.error('Failed to read error response', jsonError, textError);
    }
  }
  return message;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error('Failed to parse response JSON');
  }
};

export const fetchMotivationMasters = async (
  userId: number
): Promise<MotivationMaster[]> => {
  return request(`/api/v1/motivation_masters?user_id=${encodeURIComponent(userId)}`);
};

export const fetchPreferenceMasters = async (
  userId: number
): Promise<PreferenceMaster[]> => {
  return request(`/api/v1/preference_masters?user_id=${encodeURIComponent(userId)}`);
};

export const createMotivationMaster = async (
  userId: number,
  name: string
): Promise<MotivationMaster> => {
  return request('/api/v1/motivation_masters', {
    method: 'POST',
    body: JSON.stringify({ motivation_master: { user_id: userId, name } }),
  });
};

export const createPreferenceMaster = async (
  userId: number,
  name: string
): Promise<PreferenceMaster> => {
  return request('/api/v1/preference_masters', {
    method: 'POST',
    body: JSON.stringify({ preference_master: { user_id: userId, name } }),
  });
};

const coerceDataUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const extractDataUrlFromRecord = (
  record: Record<string, unknown> | null | undefined
): string | null => {
  if (!record) {
    return null;
  }
  const typed = record as BeforeSketchPayload & Record<string, unknown>;
  return (
    coerceDataUrl(typed.before_sketch_data_url) ??
    coerceDataUrl(typed.beforeSketchDataUrl) ??
    coerceDataUrl(typed.before_sketch_url) ??
    coerceDataUrl(typed.beforeSketchUrl) ??
    null
  );
};

const extractDataUrl = (payload: Record<string, unknown>): string | null => {
  const direct = extractDataUrlFromRecord(payload);
  if (direct) {
    return direct;
  }

  const nestedSources: Array<unknown> = [];
  if (payload.user && typeof payload.user === 'object') {
    nestedSources.push(payload.user);
  }
  if (payload.data && typeof payload.data === 'object') {
    nestedSources.push(payload.data);
    const dataRecord = payload.data as Record<string, unknown>;
    if (dataRecord.attributes && typeof dataRecord.attributes === 'object') {
      nestedSources.push(dataRecord.attributes);
    }
  }

  for (const source of nestedSources) {
    if (source && typeof source === 'object') {
      const value = extractDataUrlFromRecord(source as Record<string, unknown>);
      if (value) {
        return value;
      }
    }
  }

  return null;
};

export const fetchBeforeSketchDataUrl = async (userId: number): Promise<string | null> => {
  const payload = await request<BeforeSketchPayload & Record<string, unknown>>(
    `/api/v1/users/${encodeURIComponent(userId)}`
  );

  if (payload && typeof payload === 'object') {
    const dataUrl = extractDataUrl(payload as Record<string, unknown>);
    if (dataUrl) {
      return dataUrl;
    }
  }

  return null;
};

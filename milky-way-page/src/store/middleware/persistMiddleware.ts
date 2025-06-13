import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// 持久化到localStorage的中间件
export const persistMiddleware: Middleware<Record<string, never>, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();

    // 只持久化auth状态
    const persistedState = {
      auth: state.auth,
    };

    localStorage.setItem('milky-way-state', JSON.stringify(persistedState));
    return result;
  };

// 从localStorage恢复状态
export const loadPersistedState = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem('milky-way-state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.warn('Failed to load persisted state:', err);
    return undefined;
  }
};

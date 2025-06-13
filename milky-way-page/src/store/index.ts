import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import authSlice from './slices/authSlice';
import chatSlice from './slices/chatSlice';
import friendsSlice from './slices/friendsSlice';
import momentsSlice from './slices/momentsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    chat: chatSlice,
    friends: friendsSlice,
    moments: momentsSlice,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

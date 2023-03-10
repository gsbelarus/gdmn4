import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/security/user';
import logReducer from './features/security/log';
import nlpReducer from './features/nlp/nlpSlice';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { api2 } from './org-api';
import { api3 } from './profile-api';

export const store = configureStore({
  reducer: {
    user: userReducer,
    log: logReducer,
    nlp: nlpReducer,
    [api2.reducerPath]: api2.reducer,
    [api3.reducerPath]: api3.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api2.middleware).concat(api3.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
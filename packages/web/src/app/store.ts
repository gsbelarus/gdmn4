import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/security/user';
import logReducer from './features/security/log';
import nlpReducer from './features/nlp/nlpSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    user: userReducer,
    log: logReducer,
    nlp: nlpReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
import { logIn } from "./features/security/user";
import { TLoginRequest, LoginResponse, TRegisterRequest, RegisterResponse } from '@gdmn-cz/types';
import { z, AnyZodObject, SafeParseReturnType } from "zod";
import { AppDispatch, RootState, store } from "./store";
import { logError } from "./features/security/log";
import { AnyAction } from "@reduxjs/toolkit";

export const ftch2 = async <T extends AnyZodObject>(url: string, req: Object, parser: T) => 
{
  const { getState, dispatch } = store;
  try {
    const token = getState().user.token;
    const authHeaders: HeadersInit = token 
      ? { Authorization: `Bearer ${token}` }
      : { };

    const res = await fetch(`http://localhost:3000/${url}`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },    
      body: JSON.stringify(req)
    });
  
    if (res.ok) {
      const body = await res.json();
      const parsed: SafeParseReturnType<any, z.infer<typeof parser>> = parser.safeParse(body);
      if (parsed.success) {
        return parsed.data;
      } else {
        dispatch(logError(parsed.error.toString()));
      }
    } else {
      dispatch(logError(`${res.status} ${res.statusText}`));
    }    
  } catch (error) {
    store.dispatch(logError(JSON.stringify(error)));
  }
};

export const ftch = async <T extends AnyZodObject>(url: string, req: Object, parser: T, 
  dispatch: AppDispatch, getState: () => RootState,
  process?: (data: z.infer<typeof parser>) => AnyAction) => 
{
  try {
    const token = getState().user.token;
    const authHeaders: HeadersInit = token 
      ? { Authorization: `Bearer ${token}` }
      : { };

    const res = await fetch(`http://localhost:3000/${url}`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },    
      body: JSON.stringify(req)
    });
  
    if (res.ok) {
      const body = await res.json();
      const parsed: SafeParseReturnType<any, z.infer<typeof parser>> = parser.safeParse(body);
      if (parsed.success) {
        if (process) {
          dispatch(process(parsed.data));
        }
      } else {
        dispatch(logError(parsed.error.toString()));
      }
    } else {
      dispatch(logError(`${res.status} ${res.statusText}`));
    }    
  } catch (error) {
    dispatch(logError(JSON.stringify(error)));
  }
};

/*
export const registerApi = (req: TRegisterRequest) => async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  await ftch('register', req, RegisterResponse, dispatch, getState);
};

export const loginApi = (req: TLoginRequest) => async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  await ftch('login', req, LoginResponse, dispatch, getState, data => logIn(data) );
};
*/

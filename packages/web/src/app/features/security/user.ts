import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  email?: string;
  token?: string;
};

const initialState: UserState = { };

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logOff: () => ({}),
    logIn: (_, action: PayloadAction<{ email: string, token?: string }>) => ({
      email: action.payload.email,
      token: action.payload.token
    })
  }
});

// Action creators are generated for each case reducer function
export const { logIn, logOff } = userSlice.actions;

export default userSlice.reducer;
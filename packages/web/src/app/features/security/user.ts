import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  email?: string;
  token?: string;
  userId?: string;
  userName?: string;
};

const initialState: UserState = { };

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logOff: () => ({}),
    logIn: (_, action: PayloadAction<UserState>) => ({ ...action.payload })
  }
});

// Action creators are generated for each case reducer function
export const { logIn, logOff } = userSlice.actions;

export default userSlice.reducer;
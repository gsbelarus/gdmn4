import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface OrgState {
  users?: any[];
  loading?: boolean;
  err?: string;
};

const initialState: OrgState = {loading: true, err: ""};

export const orgSlice = createSlice({
  name: 'org',
  initialState,
  reducers: {
    getUsers: (_, action: PayloadAction<{ users: any[], loading: boolean, err: string }>) => ({
        users: action.payload.users,
        loading: action.payload.loading, 
        err: action.payload.err
    }),
  }
});

// Action creators are generated for each case reducer function
export const { getUsers } = orgSlice.actions;

export default orgSlice.reducer;
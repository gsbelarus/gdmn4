import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LogMessage = {
  id: number;
  type: 'ERROR' | 'INFORM';
  message: string;
};

export interface LogState {
  messages: LogMessage[];
};

const initialState: LogState = { 
  messages: []
};

let logId = 0;

export const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    clearLog: () => ({ messages: [] }),
    logError: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: logId++,
        type: 'ERROR',
        message: action.payload
      })
    },
    logInform: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: logId++,
        type: 'INFORM',
        message: action.payload
      })
    },
  }
});

// Action creators are generated for each case reducer function
export const { clearLog, logError, logInform } = logSlice.actions;

export default logSlice.reducer;
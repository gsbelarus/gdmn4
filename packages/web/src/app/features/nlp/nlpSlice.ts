import { NLPDialog, nlpDialogItem } from "@gdmn-cz/types";
import { detectLanguage } from "@gdmn-cz/util";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NLPState {
  nlpDialog: NLPDialog;
};

const initialState: NLPState = {
  nlpDialog: []
};

export const nlpSlice = createSlice({
  name: 'nlp',
  initialState,
  reducers: {
    pushNLPDialogItem: (state, action: PayloadAction<{ who: string; text: string }>) => {
      const { who, text } = action.payload;
      const t = text.trim();
      const l = detectLanguage(t);

      return {
        ...state,
        nlpDialog: [
          ...state.nlpDialog,
          nlpDialogItem(who, l, t)
        ]
      }
    },
    setNLPDialog: (state, action: PayloadAction<NLPDialog>) => ({
      ...state,
      nlpDialog: action.payload
    })
  }
});

// Action creators are generated for each case reducer function
export const { setNLPDialog, pushNLPDialogItem } = nlpSlice.actions;

export default nlpSlice.reducer;

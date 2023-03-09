import { pushNLPDialogItem } from "../../features/nlp/nlpSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import ChatView from "../chat-view/chat-view";

export const NlpChat = () => {
  const nlpDialog = useAppSelector( state => state.nlp.nlpDialog );
  const dispatch = useAppDispatch();

  return (
    <ChatView nlpDialog={nlpDialog} push={ 
      (who, text) => {
        dispatch(pushNLPDialogItem({ who, text })); 
        dispatch(pushNLPDialogItem({ who: 'it', text: `you said: ${text}` })); 
      }
    } />
  )
};
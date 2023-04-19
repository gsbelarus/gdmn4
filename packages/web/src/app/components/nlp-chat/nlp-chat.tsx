import { useGetAllMessagesQuery } from "../../features/nlp/chatApi";
import { pushNLPDialogItem } from "../../features/nlp/nlpSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import ChatView from "../chat-view/chat-view";

export const NlpChat = () => {
  const userId = useAppSelector( state => state.user.userId );
  const nlpDialog = useAppSelector( state => state.nlp.nlpDialog );
  const chatId = "643fa9a6de97df38268d11fe" // temporal measure
  const dispatch = useAppDispatch();

  const {data: chatMessages, isLoading} = useGetAllMessagesQuery({userId: userId, chatId: chatId});

  console.log(chatMessages);

  // need to show this messages in ChatView
  return (
    <ChatView nlpDialog={nlpDialog} push={ 
      (who, text) => {
        dispatch(pushNLPDialogItem({ who, text })); 
        dispatch(pushNLPDialogItem({ who: 'it', text: `you said: ${text}` })); 
      }
    } />
  )
};
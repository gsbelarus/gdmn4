import { useState } from "react";
import { useAddParticipantMutation, useGetAllMessagesQuery, useGetChatQuery } from "../../features/nlp/chatApi";
import { pushNLPDialogItem } from "../../features/nlp/nlpSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import ChatView from "../chat-view/chat-view";
import { Button } from "../controls/button";
import InputUnstyled from '@mui/base/InputUnstyled';
import styled from "styled-components";

// const Input = styled(InputUnstyled)`
//   .MuiInput-input {
//     border-radius: 4px;
//     width: 100%;
//   }
// `;

export const NlpChat = () => {
  const userId = useAppSelector( state => state.user.userId );
  const nlpDialog = useAppSelector( state => state.nlp.nlpDialog );
  const chatId = "643fa9a6de97df38268d11fe" // temporal measure
  const dispatch = useAppDispatch();

  const {data: chatInfo, isLoading} = useGetChatQuery(chatId, {pollingInterval: 5000});
  const [addParticipant] = useAddParticipantMutation();
  const [particId, setParticId] = useState("");

  const handleAddParticipant = () => {
    addParticipant({userId: particId, chatId: chatId})
  }

  // need to show this messages in ChatView
  return (
    !isLoading && userId &&
    <>
      {/* {
        (chatInfo?.owner === userId) && 
        <div>
          <Input onChange={e => setParticId(e.target.value)}/>
          <Button onClick={handleAddParticipant}>Add participant</Button>
        </div>
        
      } */}
      {chatInfo?.participants.includes(userId) && 
      <>
        <h3>{chatInfo.tag}</h3>
        <ChatView nlpDialog={nlpDialog} push={ 
        (who, text) => {
          dispatch(pushNLPDialogItem({ who, text })); 
          dispatch(pushNLPDialogItem({ who: 'it', text: `you said: ${text}` })); 
        }
      } info={{chatId:  chatId, userId: userId}}/>
      </>
      }
    </>
      
  )
};
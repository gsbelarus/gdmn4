import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface IAllMessagesResponse {
  content: string,
  senderId: number,
  senderName: string,
  timeStamp: string
};


export const chatApi = createApi({
  reducerPath: 'nlpChat',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllMessages: builder.query<IAllMessagesResponse[], {userId: string | undefined, chatId: string | undefined}>({
      query: ({userId, chatId}) => `chatMessages?userId=${userId}&chatId=${chatId}`
    }),
    createChat: builder.mutation<void, {ownerId: string, participantsIds: string[], tag: string}>({
      query: ({ ownerId, participantsIds, tag }) => ({
        url: 'createChat',
        method: 'POST',
        body: { ownerId, participantsIds, tag }
      })
    }),
    createMessage: builder.mutation<void, { chatId: string, text: string, userId: string, who: string }>({
        query: ({ chatId, text, userId, who }) => ({
          url: 'createMessage',
          method: 'POST',
          body: { chatId, text, userId, who }
        }),
    })
  })
});

export const { useGetAllMessagesQuery, useCreateChatMutation, useCreateMessageMutation } = chatApi;

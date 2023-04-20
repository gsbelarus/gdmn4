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
    getAllMessages: builder.query<IAllMessagesResponse[], {chatId: string | undefined}>({
      query: ({chatId}) => `chatMessages?chatId=${chatId}`
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
    }),
    getChat: builder.query<any, string>({
      query: (id) => `chatInfo?id=${id}`
    }),
    addParticipant: builder.mutation<void, {chatId: string, userId: string}>({
      query: ({chatId, userId}) => ({
        url: 'addParticipant',
        method: 'POST',
        body: {chatId, userId}
      })
    }),
  })
});

export const { useGetAllMessagesQuery, useCreateChatMutation, useCreateMessageMutation, useGetChatQuery, useAddParticipantMutation } = chatApi;

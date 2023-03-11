import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface IAllMessagesResponse {

};

export const chatApi = createApi({
  reducerPath: 'nlpChat',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllMessages: builder.query<IAllMessagesResponse, void>({
      query: () => 'allChatMessages'
    }),
  })
});

export const { useGetAllMessagesQuery } = chatApi;

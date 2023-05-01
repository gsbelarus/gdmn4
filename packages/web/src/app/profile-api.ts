import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const api3 = createApi({
    reducerPath: "profileApi",
    baseQuery: fetchBaseQuery({baseUrl: "http://localhost:3000/"}),
    endpoints: (builder) => ({
        getOrganizations: (builder.query<any, string>({
            query: (email) => `getOrganizations?email=${email}`,
        })),
        createOrganization: (builder.mutation<void, any>({
            query: (obj) => ({
                url: `createOrganization`,
                method: 'POST',
                body: obj 
            })
        })),
        leaveOrganization: (builder.mutation<void, any>({
            query: (obj) => ({
                url: `leaveOrganization`,
                method: 'DELETE',
                body: obj 
            })
        })),
        deleteProfile: (builder.mutation<void, string>({
            query: (email) => ({
                url: `deleteProfile?email=${email}`,
                method: 'DELETE',
            })
        })),
        getProfile: (builder.query<any, string>({
            query: (email) => `getProfile?email=${email}`,
        })),
        changeUsername: (builder.mutation<void, {email: string, userName: string}>({
            query: ({email, userName}) => ({
                url: `changeUsername?email=${email}`,
                method: 'POST',
                body: {userName}
            })
        })), 
    }),
});

export const {useGetOrganizationsQuery, useCreateOrganizationMutation, 
    useLeaveOrganizationMutation, useDeleteProfileMutation,
    useGetProfileQuery, useChangeUsernameMutation} = api3;
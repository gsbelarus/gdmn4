import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const api2 = createApi({
    reducerPath: "orgApi",
    baseQuery: fetchBaseQuery({baseUrl: "http://localhost:3000/", responseHandler: (response: { json: () => any }) => response.json()}),
    endpoints: (builder) => ({
        getUsers: (builder.query<any, string>({
            query: (id) => `getUsers?org=${id}`,
        })),
        addMembership: (builder.mutation<void, any>({
            query: ({id, ...rest}) => ({
                url: `addMembership?org=${id}`,
                method: 'POST',
                body: rest.newUser,
            })
        })),
        deleteMembership: (builder.mutation<void, any>({
            query: ({user_id, org_id}) => ({
                url: `deleteMembership?user=${user_id}&org=${org_id}`,
                method: 'DELETE'
            })
        })),
        updateMembership: (builder.mutation<void, any>({
            query: (obj) => ({
                url: `updateMembership`,
                method: 'PUT',
                body: obj
            })
        })),
    }),
});

export const {useGetUsersQuery, useAddMembershipMutation, useDeleteMembershipMutation, useUpdateMembershipMutation} = api2;
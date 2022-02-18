import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "../../interfaces/user";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], string>({
      query: () => "user",
      providesTags: ["User"],
    }),
    updateUser: builder.mutation<User, Partial<User>>({
      query: ({ id, ...patch }) => ({
        url: `user/${id}`,
        method: "PATCH",
        body: patch,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetAllUsersQuery, useUpdateUserMutation } = usersApi;

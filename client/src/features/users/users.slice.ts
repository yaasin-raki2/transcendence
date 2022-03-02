import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequest_Status,
} from "../../interfaces/friend-request-status.interface";
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
    getUserById: builder.query<User, number>({
      query: (id) => ({
        url: `user/${id}`,
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: "user/me",
        credentials: "include",
      }),
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
    getUserWithAvatar: builder.query<User, number>({
      query: (id) => ({
        url: `user/avatar/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    getFriends: builder.query<User[], number>({
      query: (id) => ({
        url: `friend-request/me/friends/${id}`,
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    getRecievedFriendRequests: builder.query<FriendRequest[], void>({
      query: () => ({
        url: "friend-request/me/received-requests",
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    acceptorRejectFriendRequest: builder.mutation<
      User,
      { id: number; status: FriendRequest_Status }
    >({
      query: ({ id, status }) => ({
        url: `friend-request/response/${id}`,
        method: "PUT",
        body: { status } as FriendRequestStatus,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    turnOnTwoFactorAuth: builder.mutation<User, { code2fa: string }>({
      query: (body) => ({
        url: "2fa/turn-on",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    turnOffTwoFactorAuth: builder.mutation<User, void>({
      query: () => ({
        url: "2fa/turn-off",
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<User, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useLazyGetAllUsersQuery,
  useLazyGetUserByIdQuery,
  useGetUserWithAvatarQuery,
  useGetFriendsQuery,
  useAcceptorRejectFriendRequestMutation,
  useGetRecievedFriendRequestsQuery,
  useGetCurrentUserQuery,
  useTurnOnTwoFactorAuthMutation,
  useTurnOffTwoFactorAuthMutation,
  useLogoutMutation,
} = usersApi;

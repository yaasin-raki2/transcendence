import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Room } from "../../interfaces/room";
import { Room_State } from "../../interfaces/room-state.interface";

export const roomsApi = createApi({
  reducerPath: "roomsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api" }),
  tagTypes: ["Room", "NewRoom", "NewMember"],
  endpoints: (builder) => ({
    getAllRooms: builder.query<Room[], void>({
      query: () => "room",
      providesTags: ["Room", "NewRoom"],
    }),
    getRoomById: builder.query<Room, number>({
      query: (roomName) => ({
        url: `room/${roomName}`,
        credentials: "include",
      }),
      providesTags: ["Room"],
    }),
    getRoomWithMembers: builder.query<Room, number>({
      query: (roomName) => ({
        url: `room/${roomName}/members`,
        credentials: "include",
      }),
      providesTags: ["Room", "NewMember"],
    }),
    createRoom: builder.mutation<Room, { name: string; state: Room_State }>({
      query: (createRoomDto) => ({
        url: `room/create`,
        method: "POST",
        body: createRoomDto,
        credentials: "include",
      }),
      invalidatesTags: ["NewRoom"],
    }),
    addMemberToRoom: builder.mutation<Room, { roomName: string; login: string }>({
      query: (addMemberToRoomDto) => ({
        url: `room/add-member`,
        method: "POST",
        body: addMemberToRoomDto,
        credentials: "include",
      }),
      invalidatesTags: ["NewMember"],
    }),
    removeMmeberFromRoom: builder.mutation<void, { roomName: string; login: string }>({
      query: (removeMemberFromRoomDto) => ({
        url: `room/remove-member`,
        method: "DELETE",
        body: removeMemberFromRoomDto,
        credentials: "include",
      }),
      invalidatesTags: ["NewMember"],
    }),
    deleteRoom: builder.mutation<any, string>({
      query: (roomName) => ({
        url: `room/delete/${roomName}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Room"],
    }),
  }),
});

export const {
  useGetAllRoomsQuery,
  useGetRoomByIdQuery,
  useGetRoomWithMembersQuery,
  useCreateRoomMutation,
  useAddMemberToRoomMutation,
  useRemoveMmeberFromRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;

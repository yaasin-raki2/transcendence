import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Room } from "../../interfaces/room";
import { RoomRequest } from "../../interfaces/room-request.interface";
import { Room_State } from "../../interfaces/room-state.interface";

export const roomsApi = createApi({
  reducerPath: "roomsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api" }),
  tagTypes: ["Room", "NewRoom", "NewMember", "RoomRequest"],
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
    getSentRoomRequests: builder.query<RoomRequest[], void>({
      query: () => ({
        url: "room-request/sent",
        credentials: "include",
      }),
      providesTags: ["RoomRequest"],
    }),
    getReceivedRoomRequests: builder.query<RoomRequest[], void>({
      query: () => ({
        url: "room-request/received",
        credentials: "include",
      }),
      providesTags: ["RoomRequest"],
    }),
    sendRoomRequest: builder.mutation<void, { roomName: string; recieverLogin: string }>({
      query: (dto) => ({
        url: `room-request/send`,
        method: "POST",
        body: dto,
        credentials: "include",
      }),
      invalidatesTags: ["RoomRequest"],
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
  useSendRoomRequestMutation,
  useLazyGetSentRoomRequestsQuery,
  useLazyGetReceivedRoomRequestsQuery,
} = roomsApi;

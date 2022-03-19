import { FC, useState } from "react";
import { Button } from "../components/button";
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetAllRoomsQuery,
  useLazyGetSentRoomRequestsQuery,
  useLazyGetReceivedRoomRequestsQuery,
  useSendRoomRequestMutation,
} from "../features/rooms/rooms.slice";

// !: This page has avalabale rooms, in which you can send a request to join it.
// !: You can create a room as well in here.

export const Rooms: FC = () => {
  const [roomName, setRoomName] = useState<string>("");

  const { data: rooms } = useGetAllRoomsQuery();

  const [createRoom] = useCreateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const [sendRoomRequest, { error }] = useSendRoomRequestMutation();
  const [getSentRoomRequests, { data: sentRoomRequests }] = useLazyGetSentRoomRequestsQuery();
  const [getReceivedRoomRequests, { data: receivedRoomRequests }] =
    useLazyGetReceivedRoomRequestsQuery();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-yellow-500">
      <Button text="Recieved Room Requests" onClick={() => getReceivedRoomRequests()} />
      {receivedRoomRequests?.map((roomRequest) => (
        <div
          className="bg-zinc-800 w-80 text-white rounded-md flex flex-col m-4"
          key={roomRequest.id}
        >
          <div className="flex justify-between">
            <h1 className="text-3xl p-4">{roomRequest.room.name}</h1>
            <h3 className="text-xl p-6 text-purple-600">{roomRequest.creator.logging}</h3>
          </div>
          <Button text={`Accept Joining ${roomRequest.room.name}`} />
          <Button text={`Decline Joining ${roomRequest.room.name}`} />
        </div>
      ))}
      {error && console.log(error)}
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2 w-32"
        type="text"
        value={roomName}
        placeholder="room name"
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Button text="Create Room" onClick={() => createRoom({ name: roomName, state: "private" })} />
      {rooms?.map((room) => (
        <div className="bg-zinc-800 w-80 text-white rounded-md flex flex-col m-4" key={room.id}>
          <div className="flex justify-between">
            <h1 className="text-3xl p-4">{room.name}</h1>
            <h6 className="text-sm p-1 text-yellow-500">{room.state}</h6>
          </div>
          {room.state === "private" ? (
            <Button
              text="Send A Request"
              onClick={() =>
                sendRoomRequest({ roomName: room.name, recieverLogin: room.admin.logging })
              }
            />
          ) : (
            <Button text="Join" />
          )}
        </div>
      ))}
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2 w-32"
        type="text"
        value={roomName}
        placeholder="room name"
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Button text="Delete Room" onClick={() => deleteRoom(roomName)} />
    </div>
  );
};

// TODO: A room admin page.

import { FC, useState } from "react";
import { Button } from "../components/button";
import { RecievedRoomRequests } from "../components/room/recieved-room-requests";
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetAllRoomsQuery,
  useLazyGetSentRoomRequestsQuery,
  useSendRoomRequestMutation,
} from "../features/rooms/rooms.slice";

export const Rooms: FC = () => {
  const [roomName, setRoomName] = useState<string>("");

  const { data: rooms } = useGetAllRoomsQuery();

  const [createRoom] = useCreateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const [sendRoomRequest, { error }] = useSendRoomRequestMutation();
  const [getSentRoomRequests, { data: sentRoomRequests }] = useLazyGetSentRoomRequestsQuery();

  return (
    <div className="flex flex-col justify-content items-center min-h-screen bg-white">
      {rooms && <RecievedRoomRequests rooms={rooms} />}
      {error && console.log(error)}
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2 w-32"
        type="text"
        value={roomName}
        placeholder="room name"
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Button text="Create Room" onClick={() => createRoom({ name: roomName, state: "private" })} />
      <div className="inline-flex">
        {rooms?.map((room) => (
          <div
            className="bg-white shadow-2xl w-50 text-black rounded-md flex flex-col m-4"
            key={room.id}
          >
            <div className="flex justify-between">
              <h1 className="text-xl sm:text-3xl p-4">{room.name}</h1>
              <h6 className="text-sm p-1 text-yellow-500">{room.state}</h6>
            </div>
            {room.state === "private" ? (
              <Button
                text="Send Request"
                onClick={() =>
                  sendRoomRequest({ roomName: room.name, recieverLogin: room.admin.logging })
                }
              />
            ) : (
              <Button text="Join" />
            )}
          </div>
        ))}
      </div>
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

// TODO: Handle Images with path.

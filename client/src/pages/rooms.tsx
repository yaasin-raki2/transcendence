import { FC, useState } from "react";
import { Button } from "../components/button";
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetAllRoomsQuery,
} from "../features/rooms/rooms.slice";

// !: This page has avalabale rooms, in which you can send a request to join it.
// !: You can create a room as well in here.

export const Rooms: FC = () => {
  const [roomName, setRoomName] = useState<string>("");

  const { data } = useGetAllRoomsQuery();

  const [createRoom] = useCreateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const onCreateRoomClick = async () =>
    await createRoom({ name: roomName, state: "private" });

  const onDeleteRoomClick = async () => await deleteRoom(roomName);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-yellow-500">
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2 w-32"
        type="text"
        value={roomName}
        placeholder="room name"
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Button text="Create Room" onClick={onCreateRoomClick} />
      {data?.map((room) => (
        <div
          className="bg-orange-500 w-80 rounded-md flex justify-between flex-row"
          key={room.id}
        >
          <h1 className="text-3xl p-4">{room.name}</h1>
          <h6 className="text-sm p-1 text-purple-700">{room.state}</h6>
        </div>
      ))}
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2 w-32"
        type="text"
        value={roomName}
        placeholder="room name"
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Button text="Delete Room" onClick={onDeleteRoomClick} />
    </div>
  );
};

// TODO: A room admin page.

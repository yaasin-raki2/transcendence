import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/button";
import {
  useGetRoomWithMembersQuery,
  useRemoveMmeberFromRoomMutation,
} from "../features/rooms/rooms.slice";

export const RoomMembers: FC = () => {
  const [login, setLogin] = useState("");

  const { roomName } = useParams();

  const { data: room } = useGetRoomWithMembersQuery(roomName!);

  console.log(room);

  const [removeMemberFromRoom] = useRemoveMmeberFromRoomMutation();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="flex justify-around items-center w-screen bg-white flex-wrap">
        <div className="text-center w-80 shadow-2xl">
          <img src={`http://localhost:3000/api/user/avatar_url/${room?.admin.id}`} />
          <h1 className="text-3xl p-4">{room?.admin.logging}</h1>
          <h1 className="text-2xl p-4">Admin of {room?.name}</h1>
        </div>
        <div>
          {room &&
            room.members.length > 0 &&
            room?.members.map((member) => (
              <div
                className="flex w-[400px] justify-between items-center shadow-2xl p-2"
                key={member.id}
              >
                <div className="flex justify-center items-center">
                  <img
                    className="w-16 rounded-full "
                    src={`http://localhost:3000/api/user/avatar_url/${member.id}`}
                  />
                  <h1 className="text-xl pl-2">{member.logging}</h1>
                </div>
                <Button text="Mute" />
              </div>
            ))}
        </div>
      </div>
      {roomName && (
        <div>
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2 w-32"
            type="text"
            value={login}
            placeholder="login"
            onChange={(e) => setLogin(e.target.value)}
          />
          <Button
            text="Remove Room Member"
            onClick={() => removeMemberFromRoom({ roomName, login })}
          />
        </div>
      )}
    </div>
  );
};

// TODO: Start Building The Chat

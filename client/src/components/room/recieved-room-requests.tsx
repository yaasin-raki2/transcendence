import { FC } from "react";
import { Button } from "../../components/button";
import { useLazyGetReceivedRoomRequestsQuery } from "../../features/rooms/rooms.slice";
import { Room } from "../../interfaces/room";

interface IRecievedRoomRequestsProps {
  rooms: Room[];
}

export const RecievedRoomRequests: FC<IRecievedRoomRequestsProps> = ({ rooms }) => {
  const [getReceivedRoomRequests, { data: receivedRoomRequests }] =
    useLazyGetReceivedRoomRequestsQuery();
  return (
    <div className="flex flex-col justify-content items-center bg-white">
      <Button text="Recieved Room Requests" onClick={() => getReceivedRoomRequests()} />
      {receivedRoomRequests?.map((roomRequest) => (
        <div className="bg-white shadow-2xl w-80 rounded-md flex flex-col m-4" key={roomRequest.id}>
          <img src={`http://localhost:3000/api/user/avatar_url/${roomRequest.creator.id}`} />
          <div className="flex justify-between">
            <h1 className="text-3xl p-4">{roomRequest.room.name}</h1>
            <h3 className="text-xl p-6 text-purple-600">{roomRequest.creator.logging}</h3>
          </div>
          {roomRequest.reciever.id === rooms![roomRequest.id].admin.id ? (
            <div className="flex flex-col">
              <Button
                text={`Accept ${roomRequest.creator.logging} to join ${roomRequest.room.name}`}
              />
              <Button
                text={`Reject ${roomRequest.creator.logging} to join ${roomRequest.room.name}`}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <Button text={`Accept Joining ${roomRequest.room.name}`} />
              <Button text={`Decline Joining ${roomRequest.room.name}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

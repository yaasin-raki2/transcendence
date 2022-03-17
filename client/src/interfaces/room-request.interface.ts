import { FriendRequest_Status } from "./friend-request-status.interface";
import { Room } from "./room";
import { User } from "./user";

export interface RoomRequest {
  id: number;

  creator: User;

  reciever: User;

  room: Room;

  status: FriendRequest_Status;
}

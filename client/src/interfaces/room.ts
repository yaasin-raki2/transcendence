import { Room_State } from "./room-state.interface";
import { User } from "./user";

export interface Room {
  id: number;

  name: string;

  state: Room_State;

  admin: User;

  members: User[];
}

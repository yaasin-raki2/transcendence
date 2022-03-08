import { IsString } from "class-validator";
import { Room_State } from "../interfaces/room-state.interface";

export class CreateRoomDto {
	@IsString()
	name: string;

	@IsString()
	state: Room_State;
}

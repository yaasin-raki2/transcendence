import { IsString, Length } from "class-validator";
import { Room_State } from "../interfaces/room-state.interface";

export class CreateRoomDto {
	@IsString()
	@Length(3, 15)
	name: string;

	@IsString()
	state: Room_State;
}

import { IsString } from "class-validator";

export class CreateRoomRequestDto {
	@IsString()
	roomName: string;

	@IsString()
	recieverLogin: string;
}

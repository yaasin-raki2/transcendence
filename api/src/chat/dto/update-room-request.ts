import { IsNumber, IsString } from "class-validator";
import { FriendRequest_Status } from "src/user/interfaces/friend-request-status.interface";

export class UpdateRoomRequestDto {
	@IsNumber()
	requestId: number;

	@IsString()
	requestStatus: FriendRequest_Status;

	@IsString()
	roomName: string;
}

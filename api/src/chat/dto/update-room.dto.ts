import { PartialType } from "@nestjs/mapped-types";
import { CreateRoomDto } from "./create-room.dto";

export class UpdateChatDto extends PartialType(CreateRoomDto) {
	id: number;
}

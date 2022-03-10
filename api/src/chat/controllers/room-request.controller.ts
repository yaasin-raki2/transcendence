import {
	BadRequestException,
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	NotFoundException,
	Post,
	Req,
	UseGuards
} from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { RequestWithUser } from "src/auth/interfaces/request-with-user.interface";
import { CreateRoomRequestDto } from "../dto/create-room-request.dto";
import { UpdateRoomRequestDto } from "../dto/update-room-request";
import { RoomRequest } from "../entities/room-request.entity";
import { RoomRequestService } from "../services/room-request.service";

@Controller("room-request")
export class RoomRequestController {
	constructor(private readonly roomRequestService: RoomRequestService) {}

	@Get("sent")
	@UseGuards(JwtGuard)
	async getSentRoomRequests(@Req() req: RequestWithUser): Promise<RoomRequest[]> {
		return await this.roomRequestService.findAllByCreator(req.user.logging);
	}

	@Get("received")
	@UseGuards(JwtGuard)
	async getReceivedRoomRequests(@Req() req: RequestWithUser): Promise<RoomRequest[]> {
		return await this.roomRequestService.findAllByReciever(req.user.logging);
	}

	@Post("send")
	@UseGuards(JwtGuard)
	async createRoomRequest(
		@Req() req: RequestWithUser,
		@Body() dto: CreateRoomRequestDto
	): Promise<void> {
		try {
			await this.roomRequestService.create(dto, req.user);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	@Post("respond")
	@UseGuards(JwtGuard)
	async respondRoomRequest(
		@Req() req: RequestWithUser,
		@Body() dto: UpdateRoomRequestDto
	): Promise<void> {
		//TODO: Only Allow this OP if the reciever is the current user
		try {
			await this.roomRequestService.respond(dto, req.user);
		} catch (error) {
			if (error.message === "You can't respond to your own request")
				throw new BadRequestException(error.message);
			else if (error.message === "Room Request not found")
				throw new NotFoundException(error.message);
			throw new InternalServerErrorException(error.message);
		}
	}
}

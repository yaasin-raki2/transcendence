import {
	BadRequestException,
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	NotFoundException,
	Param,
	Post,
	Req,
	UnauthorizedException,
	UseGuards
} from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { RequestWithUser } from "src/auth/interfaces/request-with-user.interface";
import { ChatErrors } from "src/core/errors/chat-errors.enum";
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

	@Get("/:id")
	@UseGuards(JwtGuard)
	async getRoomRequest(
		@Param("id") id: number,
		@Req() req: RequestWithUser
	): Promise<RoomRequest> {
		const roomRequest = await this.roomRequestService.findOneWithAllRelations(id);
		if (
			roomRequest.creator.id !== req.user.id &&
			roomRequest.reciever.id !== req.user.id
		)
			throw new UnauthorizedException(
				ChatErrors.YOU_DONT_HAVE_PERMISSION_TO_DO_THIS
			);
		return roomRequest;
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
			if (error.message === ChatErrors.ROOM_REQUEST_NOT_FOUND)
				throw new NotFoundException(error.message);
			if (
				error.message ===
				ChatErrors.YOU_CANT_RESPOND_TO_A_REQUEST_THAT_ISNT_FOR_YOU
			)
				throw new UnauthorizedException(error.message);
			if (
				error.message === ChatErrors.YOU_CANT_RESPOND_TO_YOURSELF ||
				error.message ===
					ChatErrors.YOU_CANT_RESPOND_TO_A_REQUEST_THAT_IS_ALREADY_RESPONDED
			)
				throw new BadRequestException(error.message);
			throw new InternalServerErrorException(error.message);
		}
	}
}

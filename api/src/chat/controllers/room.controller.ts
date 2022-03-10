import {
	BadRequestException,
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	NotFoundException,
	Param,
	Post,
	Query,
	Req,
	UnauthorizedException,
	UseGuards
} from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { RequestWithUser } from "src/auth/interfaces/request-with-user.interface";
import { ChatErrors } from "src/core/errors/chat-errors.enum";
import { UserErrors } from "src/core/errors/user-errors.enum";
import { CreateRoomDto } from "../dto/create-room.dto";
import { Room } from "../entities/room.entity";
import { RoomService } from "../services/room.service";

@Controller("room")
export class RoomController {
	constructor(private readonly roomService: RoomService) {}

	@Get()
	async getAllRooms(): Promise<Room[]> {
		return await this.roomService.findAll();
	}

	@Get("/:roomName")
	async getRoom(@Param("roomName") roomName: string): Promise<Room> {
		console.log(roomName);
		return await this.roomService.findOne(roomName);
	}

	@Get("/:roomName/members")
	async getRoomWithMembers(@Param("roomName") roomName: string): Promise<Room> {
		return await this.roomService.findOneWithMembers(roomName);
	}

	//! Create an Errors Messages Enum And Group it By Controller

	@Post("/add-member")
	async addMemberToRoom(
		@Query("roomName") roomName: string,
		@Query("login") login: string
	): Promise<Room> {
		//TODO: Only Allow this OP to a room admin user or som1 who just got invited by admin
		//TODO: Search for the user to be added in room-requests,
		//TODO: by reciever is him and creator is admin and vice versa,
		//TODO: if there is no requests, or requests are not accepted,
		//TODO: throw Unauthorized Exception
		let room: Room;
		try {
			room = await this.roomService.addMember(roomName, login);
		} catch (error) {
			if (error.message === ChatErrors.ROOM_NOT_FOUND)
				throw new NotFoundException(error.message);
			else if (error.message === UserErrors.USER_NOT_FOUND)
				throw new NotFoundException(error.message);
			else if (error.message === ChatErrors.USER_IS_ALREADY_A_MEMBER_OF_THIS_ROOM)
				throw new BadRequestException(error.message);
			else if (
				error.message ===
				ChatErrors.USER_IS_NOT_INVITED_TO_ROOM_OR_ROOM_REQUEST_IS_NOT_ACCEPTED
			)
				throw new BadRequestException(error.message);
			else throw new InternalServerErrorException(error.message);
		}
		return room;
	}

	@Post("remove-member")
	async removeMember(
		@Query("roomName") roomName: string,
		@Query("login") login: string,
		@Req() req: RequestWithUser
	): Promise<Room> {
		//TODO: Only Allow this OP to a room admin user
		let room: Room;
		try {
			room = await this.roomService.removeMember(roomName, login, req.user);
		} catch (error) {
			if (error.message === ChatErrors.ROOM_NOT_FOUND)
				throw new NotFoundException(error.message);
			else if (error.message === UserErrors.USER_NOT_FOUND)
				throw new NotFoundException(error.message);
			else if (error.message === ChatErrors.USER_IS_NOT_A_MEMBER_OF_THIS_ROOM)
				throw new BadRequestException(error.message);
			else if (
				error.message ===
				ChatErrors.ONLY_THE_ADMIN_OF_THIS_ROOM_CAN_REMOVE_A_MEMBER
			)
				throw new UnauthorizedException(error.message);
			else throw new InternalServerErrorException(error.message);
		}
		return room;
	}

	@Post("create")
	@UseGuards(JwtGuard)
	async createRoom(@Body() createRoomDto: CreateRoomDto, @Req() req: RequestWithUser) {
		const room = await this.roomService.createRoom(createRoomDto, req.user);
	}

	@Post("join")
	@UseGuards(JwtGuard)
	async joinRoom(
		@Body() roomName: string,
		@Req() req: RequestWithUser
	): Promise<boolean> {
		const room = await this.roomService.findOne(roomName);
		// Send request to admin if state is private
		if (room.state === "private") {
		}
		// Join Room
		return true;
	}
}

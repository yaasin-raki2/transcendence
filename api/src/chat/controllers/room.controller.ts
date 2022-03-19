import {
	BadRequestException,
	Body,
	Controller,
	Delete,
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
import { UserErrors } from "src/core/errors/user-errors.enum";
import { DeleteResult } from "typeorm";
import { CreateRoomDto } from "../dto/create-room.dto";
import { Room } from "../entities/room.entity";
import { RoomService } from "../services/room.service";

@Controller("room")
export class RoomController {
	constructor(private readonly roomService: RoomService) {}

	@Get()
	async getAllRooms(): Promise<Room[]> {
		let rooms: Room[];
		try {
			rooms = await this.roomService.findAll();
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
		return rooms;
	}

	@Get("/:roomName")
	async getRoom(@Param("roomName") roomName: string): Promise<Room> {
		let room: Room;
		try {
			room = await this.roomService.findOne(roomName);
		} catch (error) {
			if (error.message === ChatErrors.ROOM_NOT_FOUND)
				throw new NotFoundException(error.message);
			else throw new InternalServerErrorException(error.message);
		}
		return room;
	}

	@Get("/:roomName/members")
	@UseGuards(JwtGuard)
	async getRoomWithMembers(@Param("roomName") roomName: string): Promise<Room> {
		let room: Room;
		try {
			room = await this.roomService.findOneWithMembers(roomName);
		} catch (error) {
			if (error.message === ChatErrors.ROOM_NOT_FOUND)
				throw new NotFoundException(error.message);
			else throw new InternalServerErrorException(error.message);
		}
		return room;
	}

	//! Create an Errors Messages Enum And Group it By Controller

	@Post("/add-member")
	@UseGuards(JwtGuard)
	async addMemberToRoom(
		@Body() { roomName, login }: { roomName: string; login: string }
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

	@Delete("remove-member")
	@UseGuards(JwtGuard)
	async removeMember(
		@Body() { roomName, login }: { roomName: string; login: string },
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
	async createRoom(
		@Body() createRoomDto: CreateRoomDto,
		@Req() req: RequestWithUser
	): Promise<void> {
		try {
			await this.roomService.createRoom(createRoomDto, req.user);
		} catch (error) {
			if (error.message === ChatErrors.ROOM_ALREADY_EXISTS)
				throw new BadRequestException(error.message);
			throw new InternalServerErrorException(error.message);
		}
	}

	@Delete("delete/:roomName")
	@UseGuards(JwtGuard)
	async deleteRoom(
		@Param("roomName") roomName: string,
		@Req() req: RequestWithUser
	): Promise<DeleteResult> {
		let result: DeleteResult;
		try {
			result = await this.roomService.deleteRoom(roomName, req.user);
		} catch (error) {
			if (error.message === ChatErrors.ROOM_NOT_FOUND)
				throw new NotFoundException(error.message);
			if (
				error.message ===
				ChatErrors.ONLY_THE_ADMIN_OF_THIS_ROOM_CAN_DELETE_THIS_ROOM
			)
				throw new UnauthorizedException(error.message);
			throw new InternalServerErrorException(error.message);
		}
		return result;
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

	// TODO: Send a message and recieve it from another user. then persist to DB

	// TODO: Joining a Room to start chating
}

import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Req,
	UseGuards
} from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { RequestWithUser } from "src/auth/interfaces/request-with-user.interface";
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

	@Post("/add-member")
	async addMemberToRoom(
		@Query("roomName") roomName: string,
		@Query("login") login: string
	): Promise<Room> {
		console.log(login);
		return await this.roomService.addMember(roomName, login);
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

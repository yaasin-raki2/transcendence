import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { RequestWithUser } from "src/auth/interfaces/request-with-user.interface";
import { UserService } from "src/user/services/user.service";
import { ChatService } from "./chat.service";
import { CreateRoomDto } from "./dto/create-room.dto";

@Controller("room")
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly userService: UserService
	) {}

	@Get()
	async getAllRooms() {
		return await this.chatService.getAllRooms();
	}

	@Post("create")
	@UseGuards(JwtGuard)
	async createRoom(@Body() createRoomDto: CreateRoomDto, @Req() req: RequestWithUser) {
		const room = await this.chatService.createRoom(createRoomDto, req.user);
	}

	@Post("join")
	@UseGuards(JwtGuard)
	async joinRoom(
		@Body() roomName: string,
		@Req() req: RequestWithUser
	): Promise<boolean> {
		const room = await this.chatService.findRoomByName(roomName);
		// Send request to admin if state is private
		if (room.state === "private") {
			const admin = await this.userService.findUserById(room.adminId);
			await this.chatService.sendFriendRequest(admin, req.user);
		}
		// Join Room
		return true;
	}
}

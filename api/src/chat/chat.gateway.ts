import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WsException,
	ConnectedSocket
} from "@nestjs/websockets";
import { ChatService } from "./services/chat.service";
import { Socket } from "socket.io";
import { User } from "src/user/entities/user.entity";
import { CreateRoomDto } from "./dto/create-room.dto";

@WebSocketGateway()
export class ChatGateway {
	constructor(private readonly chatService: ChatService) {}

	authenticated: boolean;

	async handleConnection(socket: Socket) {
		try {
			await this.chatService.getUserFromSocket(socket);
			this.authenticated = true;
		} catch (error) {
			if (error.message === "Unauthorized" || error.message == "jwt expired")
				this.authenticated = false;
			this.authenticated = false;
		}
	}

	@SubscribeMessage("join_room")
	async createRoom(
		@MessageBody() createRoomDto: CreateRoomDto,
		@ConnectedSocket() socket: Socket
	) {
		const admin = await this.chatService.getUserFromSocket(socket);
		const room = await this.chatService.createRoom(createRoomDto, admin);
		socket.join(room.name);
	}

	@SubscribeMessage("send_message")
	async listenForMessages(
		@MessageBody() content: any,
		@ConnectedSocket() socket: Socket
	) {
		let author: User;
		try {
			author = await this.chatService.getUserFromSocket(socket);
		} catch (error) {
			if (
				error.message === "Unauthorized" ||
				error.message == "jwt expired" ||
				!this.authenticated
			)
				throw new WsException("Unauthorized");
			throw new WsException("Internal server error");
		}

		socket.in(content.room).emit("receive_message", content);
	}
}

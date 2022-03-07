import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	WsException,
	ConnectedSocket
} from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server, Socket } from "socket.io";
import { User } from "src/user/entities/user.entity";

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
	createRoom(@MessageBody() room: string, @ConnectedSocket() socket: Socket) {
		socket.join(room);
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

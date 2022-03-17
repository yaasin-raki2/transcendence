import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WsException,
	ConnectedSocket
} from "@nestjs/websockets";
import { ChatService } from "./services/chat.service";
import { Socket } from "socket.io";
import { CreateRoomDto } from "./dto/create-room.dto";
import { RoomService } from "./services/room.service";
import { Room } from "./entities/room.entity";
import { ChatErrors } from "src/core/errors/chat-errors.enum";

@WebSocketGateway()
export class ChatGateway {
	constructor(
		private readonly chatService: ChatService,
		private readonly roomService: RoomService
	) {}

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

	@SubscribeMessage("start_chating_in_room")
	async startChatingInRoom(
		@MessageBody() createRoomDto: CreateRoomDto,
		@ConnectedSocket() socket: Socket
	) {
		// !: Check if user is authenticated
		const user = await this.chatService.getUserFromSocket(socket);

		// !: Check if room already exists
		let room: Room;
		try {
			room = await this.roomService.findOneWithMembers(createRoomDto.name);
		} catch (err) {
			if (err.message === ChatErrors.ROOM_NOT_FOUND)
				throw new WsException(err.message);
			throw new WsException("Internal server error");
		}

		// !: Check if user is an admin or a member of the room
		if (room.admin.id !== user.id) {
			const member = room.members.find(member => member.id === user.id);
			if (!member) throw new WsException("Unauthorized");
		}

		socket.join(room.name);
	}

	@SubscribeMessage("send_message")
	async listenForMessages(
		@MessageBody() content: any,
		@ConnectedSocket() socket: Socket
	) {
		try {
			await this.chatService.getUserFromSocket(socket);
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

	// TODO: A user will send an HTTP POST request to join a room, if he joined successfully, The backend will send a response indicating that the user has joined the room with Messages History. then The Frontend will send a WS request to the backend to enter the WS room.

	// ?: Create Room Button
	// ?: Join Room Button
	// ?: Start Chating Button

	// TODO: Create Dummy Data for testing
}

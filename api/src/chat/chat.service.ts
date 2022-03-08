import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { AuthService } from "src/auth/services/auth.service";
import { parse } from "cookie";
import { User } from "src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "./entities/room.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "./dto/create-room.dto";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Room) private readonly roomRepository: Repository<Room>,
		private readonly authService: AuthService
	) {}

	async getUserFromSocket(socket: Socket): Promise<User | null> {
		const cookie = socket.handshake.headers.cookie;
		if (!cookie) throw new Error("Invalid credentials.");
		const { Authentication: authenticationToken } = parse(cookie);
		const user = await this.authService.getUserFromAuthenticationToken(
			authenticationToken
		);
		if (!user) throw new Error("Unauthorized");
		return user;
	}

	async getAllRooms(): Promise<Room[]> {
		return await this.roomRepository.find({ relations: ["admin"] });
	}

	async findRoomByName(name: string): Promise<Room> {
		return await this.roomRepository.findOne({ name });
	}

	async createRoom(createRoomDto: CreateRoomDto, admin: User): Promise<Room> {
		let room: Room;
		try {
			room = await this.findRoomByName(createRoomDto.name);
			if (room) throw new Error("Room already exists.");
		} catch (error) {
			if (error.message === "Room already exists.")
				throw new WsException("Room already exists.");
			throw new WsException("Internal server error");
		}
		const roomInfo = { ...createRoomDto, admin };
		room = await this.roomRepository.create(roomInfo as Object);
		return this.roomRepository.save(room);
	}
}

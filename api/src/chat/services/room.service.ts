import { Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "../entities/room.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "../dto/create-room.dto";
import { UserService } from "src/user/services/user.service";

@Injectable()
export class RoomService {
	constructor(
		@InjectRepository(Room) private readonly roomRepository: Repository<Room>,
		private readonly userService: UserService
	) {}

	async findAll(): Promise<Room[]> {
		return await this.roomRepository.find();
	}

	async findOne(name: string): Promise<Room> {
		return await this.roomRepository.findOne({ name }, { relations: ["admin"] });
	}

	async findOneWithMembers(name: string): Promise<Room> {
		return await this.roomRepository.findOne(
			{ name },
			{ relations: ["admin", "members"] }
		);
	}

	async createRoom(createRoomDto: CreateRoomDto, admin: User): Promise<Room> {
		let room: Room;
		room = await this.findOne(createRoomDto.name);
		if (room) throw new Error("Room already exists.");
		const roomInfo = { ...createRoomDto, admin };
		room = await this.roomRepository.create(roomInfo as Object);
		return this.roomRepository.save(room);
	}

	async addMember(roomName: string, login: string): Promise<Room> {
		const member = await this.userService.findOneByLogging(login);
		const room = await this.findOneWithMembers(roomName);
		room.members = [...room.members, member];
		return this.roomRepository.save(room);
	}
}

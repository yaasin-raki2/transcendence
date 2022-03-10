import { Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "../entities/room.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "../dto/create-room.dto";
import { UserService } from "src/user/services/user.service";
import { RoomRequestService } from "./room-request.service";

@Injectable()
export class RoomService {
	constructor(
		@InjectRepository(Room) private readonly roomRepository: Repository<Room>,
		private readonly roomRequestService: RoomRequestService,
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
		//TODO: check if user is already in the room
		const room = await this.findOneWithMembers(roomName);
		const member = await this.userService.findOneByLogging(login);
		if (room.members.includes(member))
			throw new Error("User is already a member of this room");
		//!: Search for the user to be added in room-requests,
		//!: by reciever is him and creator is admin and vice versa,
		//!: if there is no requests, or requests are not accepted,
		//!: throw Unauthorized Exception
		const found1 =
			await this.roomRequestService.findOneByCreatorAndRecieverAndStatusAndRoom(
				room.admin.id,
				member.id,
				"accepted",
				room.name
			);
		const found2 =
			await this.roomRequestService.findOneByCreatorAndRecieverAndStatusAndRoom(
				member.id,
				room.admin.id,
				"accepted",
				room.name
			);
		if (!found1 && !found2)
			throw new Error(
				"User is not invited to the room or room request is not accepted"
			);
		room.members = [...room.members, member];
		return this.roomRepository.save(room);
	}

	async removeMember(roomName: string, login: string, user: User): Promise<Room> {
		const room = await this.findOneWithMembers(roomName);
		if (user.id !== room.admin.id) throw new Error("Only admin can remove members");
		const member = await this.userService.findOneByLogging(login);
		if (!room.members.includes(member))
			throw new Error("User is not a member of this room");
		room.members = room.members.filter(m => m.logging !== member.logging);
		return await this.roomRepository.save(room);
	}
}

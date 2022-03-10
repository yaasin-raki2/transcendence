import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "../entities/room.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "../dto/create-room.dto";
import { UserService } from "src/user/services/user.service";
import { RoomRequestService } from "./room-request.service";
import { ChatErrors } from "src/core/errors/chat-errors.enum";

@Injectable()
export class RoomService {
	constructor(
		@InjectRepository(Room) private readonly roomRepository: Repository<Room>,
		@Inject(forwardRef(() => RoomRequestService))
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
		if (room) throw new Error(ChatErrors.ROOM_ALREADY_EXISTS);
		const roomInfo = { ...createRoomDto, admin };
		room = await this.roomRepository.create(roomInfo as Object);
		return this.roomRepository.save(room);
	}

	async addMember(roomName: string, login: string): Promise<Room> {
		//TODO: check if user is already in the room
		const room = await this.findOneWithMembers(roomName);
		const member = await this.userService.findOneByLogging(login);
		if (room.members.includes(member))
			throw new Error(ChatErrors.USER_IS_ALREADY_A_MEMBER_OF_THIS_ROOM);
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
				ChatErrors.USER_IS_NOT_INVITED_TO_ROOM_OR_ROOM_REQUEST_IS_NOT_ACCEPTED
			);

		room.members = [...room.members, member];
		return this.roomRepository.save(room);
	}

	async removeMember(roomName: string, login: string, user: User): Promise<Room> {
		const room = await this.findOneWithMembers(roomName);
		if (user.id !== room.admin.id)
			throw new Error(ChatErrors.ONLY_THE_ADMIN_OF_THIS_ROOM_CAN_REMOVE_A_MEMBER);
		const member = await this.userService.findOneByLogging(login);
		if (!room.members.includes(member))
			throw new Error(ChatErrors.USER_IS_NOT_A_MEMBER_OF_THIS_ROOM);
		room.members = room.members.filter(m => m.logging !== member.logging);
		return await this.roomRepository.save(room);
	}
}

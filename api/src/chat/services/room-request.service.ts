import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { FriendRequest_Status } from "src/user/interfaces/friend-request-status.interface";
import { UserService } from "src/user/services/user.service";
import { DeleteResult, Repository } from "typeorm";
import { CreateRoomRequestDto } from "../dto/create-room-request.dto";
import { UpdateRoomRequestDto } from "../dto/update-room-request";
import { RoomRequest } from "../entities/room-request.entity";
import { RoomService } from "./room.service";

@Injectable()
export class RoomRequestService {
	constructor(
		@InjectRepository(RoomRequest)
		private readonly roomRequestRepository: Repository<RoomRequest>,
		private readonly roomService: RoomService,
		private readonly userService: UserService
	) {}

	async findAll(): Promise<RoomRequest[]> {
		return await this.roomRequestRepository.find();
	}

	async findOne(id: number): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne(id);
	}

	async findOneWithRoom(id: number): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne(id, {
			relations: ["room"]
		});
	}

	async create(
		{ roomName, recieverLogin }: CreateRoomRequestDto,
		creator: User
	): Promise<RoomRequest> {
		const room = await this.roomService.findOneWithMembers(roomName);
		const reciever = await this.userService.findOneByLogging(recieverLogin);
		if (
			creator.logging !== room.admin.logging &&
			recieverLogin !== room.admin.logging
		)
			throw new Error(
				"You can't send a request to enter a room to a non admin user"
			);
		if (creator.logging === recieverLogin)
			throw new Error("You can't send a request to yourself");
		if (room.members.includes(creator) && creator.logging !== room.admin.logging)
			throw new Error("Only the admin of this room can send a request");
		if (room.members.includes(reciever) && reciever.logging !== room.admin.logging)
			throw new Error("You can't send a request to a member of the room");
		const roomRequest = await this.roomRequestRepository.create({
			room,
			creator,
			reciever,
			status: "pending"
		});
		return await this.roomRequestRepository.save(roomRequest);
	}

	async update(roomRequest: RoomRequest): Promise<RoomRequest> {
		return await this.roomRequestRepository.save(roomRequest);
	}

	async delete(id: number): Promise<DeleteResult> {
		return await this.roomRequestRepository.delete(id);
	}

	async findAllByCreator(logging: string): Promise<RoomRequest[]> {
		const relations = this.roomRequestRepository.metadata.relations.map(
			relation => relation.propertyName
		);
		return await this.roomRequestRepository.find({
			relations: ["creator"],
			where: [{ creator: { logging } }]
		});
	}

	async findAllByReciever(logging: string): Promise<RoomRequest[]> {
		return await this.roomRequestRepository.find({
			relations: ["reciever"],
			where: [{ reciever: { logging } }]
		});
	}

	async respond(
		{ requestId, requestStatus, roomName }: UpdateRoomRequestDto,
		responder: User
	): Promise<RoomRequest> {
		let roomRequest: RoomRequest;
		try {
			roomRequest = await this.findOneWithRoom(requestId);
		} catch (error) {
			if (!roomRequest) throw new Error("Room Request not found");
			throw new Error();
		}
		if (
			roomRequest.reciever.id === responder.id ||
			roomRequest.status !== "pending"
		) {
			throw new Error("You can't respond to your own request");
		}
		roomRequest.status = requestStatus;
		roomRequest = await this.roomRequestRepository.save(roomRequest);
		if (roomRequest.status === "accepted")
			await this.roomService.addMember(roomName, responder.logging);
		//TODO: send notification to the other user
		return roomRequest;
	}

	async findOneByCreatorAndRecieverAndStatusAndRoom(
		creator: number,
		reciever: number,
		status: FriendRequest_Status,
		roomName: string
	): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne({
			where: [
				{ creator: { id: creator } },
				{ reciever: { id: reciever } },
				{ status },
				{ room: { name: roomName } }
			]
		});
	}

	async findOneByCreatorAndReciever(
		creator: number,
		reciever: number
	): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne({
			where: [
				{
					creator: {
						id: creator
					}
				},
				{
					reciever: {
						id: reciever
					}
				}
			]
		});
	}

	async findOneByCreatorAndRecieverAndStatus(
		creator: number,
		reciever: number,
		status: string
	): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne({
			where: [
				{
					creator: {
						id: creator
					}
				},
				{
					reciever: {
						id: reciever
					}
				},
				{
					status: status
				}
			]
		});
	}

	async findOneByRoom(roomName: string): Promise<RoomRequest[]> {
		return await this.roomRequestRepository.find({
			where: [
				{
					room: {
						name: roomName
					}
				}
			]
		});
	}

	async findOneByRoomAndStatus(
		roomName: string,
		status: FriendRequest_Status
	): Promise<RoomRequest[]> {
		return await this.roomRequestRepository.find({
			where: [
				{
					room: {
						name: roomName
					}
				},
				{
					status: status
				}
			]
		});
	}

	async findOneByRoomAndStatusAndCreator(
		roomName: string,
		status: string,
		creator: number
	): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne({
			where: [
				{
					room: {
						name: roomName
					}
				},
				{
					status: status
				},
				{
					creator: {
						id: creator
					}
				}
			]
		});
	}

	async findOneByRoomAndStatusAndReciever(
		roomName: string,
		status: string,
		reciever: number
	): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne({
			where: [
				{
					room: {
						name: roomName
					}
				},
				{
					status: status
				},
				{
					reciever: {
						id: reciever
					}
				}
			]
		});
	}
}

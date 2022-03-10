import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatErrors } from "src/core/errors/chat-errors.enum";
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
		@Inject(forwardRef(() => RoomService))
		private readonly roomService: RoomService,
		private readonly userService: UserService
	) {}

	async findAll(): Promise<RoomRequest[]> {
		return await this.roomRequestRepository.find();
	}

	async findOne(id: number): Promise<RoomRequest> {
		const roomRequest = await this.roomRequestRepository.findOne(id);
		if (!roomRequest) throw new Error(ChatErrors.ROOM_REQUEST_NOT_FOUND);
		return roomRequest;
	}

	async findOneWithRoom(id: number): Promise<RoomRequest> {
		const roomRequest = await this.roomRequestRepository.findOne(id, {
			relations: ["room"]
		});
		if (!roomRequest) throw new Error(ChatErrors.ROOM_REQUEST_NOT_FOUND);
		return roomRequest;
	}

	async findOneWithCreator(id: number): Promise<RoomRequest> {
		const roomRequest = await this.roomRequestRepository.findOne(id, {
			relations: ["creator"]
		});
		if (!roomRequest) throw new Error(ChatErrors.ROOM_REQUEST_NOT_FOUND);
		return roomRequest;
	}

	async findOneWithReciever(id: number): Promise<RoomRequest> {
		const roomRequest = await this.roomRequestRepository.findOne(id, {
			relations: ["reciever"]
		});
		if (!roomRequest) throw new Error(ChatErrors.ROOM_REQUEST_NOT_FOUND);
		return roomRequest;
	}

	async findOneWithCreatorAndReciever(id: number): Promise<RoomRequest> {
		const roomRequest = await this.roomRequestRepository.findOne(id, {
			relations: ["creator", "reciever"]
		});
		if (!roomRequest) throw new Error(ChatErrors.ROOM_REQUEST_NOT_FOUND);
		return roomRequest;
	}

	async findOneWithAllRelations(id: number): Promise<RoomRequest> {
		const relations = this.roomRequestRepository.metadata.relations.map(
			relation => relation.propertyName
		);
		const roomRequest = await this.roomRequestRepository.findOne(id, {
			relations: [...relations, "room.members", "room.admin"]
		});
		if (!roomRequest) throw new Error(ChatErrors.ROOM_REQUEST_NOT_FOUND);
		return roomRequest;
	}

	async findExistingRoomRequest(
		creator: number,
		reciever: number,
		roomName: string
	): Promise<RoomRequest> {
		return await this.roomRequestRepository.findOne({
			where: [
				{ creator, reciever, roomName },
				{ creator: reciever, reciever: creator, roomName }
			]
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
				ChatErrors.YOU_CANT_SEND_A_REQUEST_TO_ENTER_A_ROOM_TO_A_NON_ADMIN_USER
			);
		if (creator.logging === recieverLogin)
			throw new Error(ChatErrors.YOU_CANT_SEND_A_REQUEST_TO_YOURSELF);
		if (room.members.includes(creator) && creator.logging !== room.admin.logging)
			throw new Error(ChatErrors.ONLY_THE_ADMIN_OF_THIS_ROOM_CAN_SEND_A_REQUEST);
		if (room.members.includes(reciever) && reciever.logging !== room.admin.logging)
			throw new Error(ChatErrors.YOU_CANT_SEND_A_REQUEST_TO_A_MEMBER_OF_THE_ROOM);
		const existingRoomRequest = await this.findExistingRoomRequest(
			creator.id,
			reciever.id,
			roomName
		);
		if (existingRoomRequest)
			throw new Error(ChatErrors.YOU_ALREADY_HAVE_A_REQUEST_TO_ENTER_THIS_ROOM);
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
		let roomRequest = await this.findOneWithCreator(requestId);
		if (roomRequest.creator.id === responder.id)
			throw new Error(ChatErrors.YOU_CANT_RESPOND_TO_YOURSELF);
		if (roomRequest.reciever.id !== responder.id)
			throw new Error(ChatErrors.YOU_CANT_RESPOND_TO_A_REQUEST_THAT_ISNT_FOR_YOU);
		if (roomRequest.status !== "pending")
			throw new Error(
				ChatErrors.YOU_CANT_RESPOND_TO_A_REQUEST_THAT_IS_ALREADY_RESPONDED
			);
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
			relations: ["creator", "reciever", "room"],
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

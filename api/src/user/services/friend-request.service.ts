import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FriendRequest } from "../entities/friend-request.entity";
import { User } from "../entities/user.entity";
import {
	FriendRequestStatus,
	FriendRequest_Status
} from "../interfaces/friend-request-status.interface";
import { UserService } from "./user.service";

@Injectable()
export class FriendRequestService {
	constructor(
		@InjectRepository(FriendRequest)
		private readonly friendRequestRepository: Repository<FriendRequest>,
		private readonly userService: UserService
	) {}

	async hasRequestBeenSentOrRecieved(creator: User, reciever: User): Promise<boolean> {
		const friendRequest = await this.friendRequestRepository.findOne({
			where: [
				{ creator, reciever },
				{ creator: reciever, reciever: creator }
			]
		});
		return !friendRequest ? false : true;
	}

	async sendFriendRequest(receiverId: number, creator: User): Promise<FriendRequest> {
		if (receiverId === creator.id)
			throw new Error("You can't send friend request to yourself");

		const reciever = await this.userService.findOne(receiverId);

		const bool = await this.hasRequestBeenSentOrRecieved(creator, reciever);

		if (bool) throw new Error("You have already sent or recieved a friend request");

		let friendRequest: FriendRequest = {
			creator,
			reciever,
			status: "pending"
		};

		return this.friendRequestRepository.save(friendRequest);
	}

	async getFriendRequestStatus(
		receiverId: number,
		currentUser: User
	): Promise<FriendRequestStatus> {
		const reciever = await this.userService.findOne(receiverId);

		const friendRequest = await this.friendRequestRepository.findOne({
			creator: currentUser,
			reciever
		});

		let friendRequestStatus: FriendRequestStatus = { status: friendRequest.status };

		return friendRequestStatus;
	}

	async getFriendRequestUserById(id: number): Promise<FriendRequest> {
		return await this.friendRequestRepository.findOne(id);
	}

	async respondToFriendRequest(
		status: FriendRequest_Status,
		friendRequestId: number
	): Promise<FriendRequestStatus> {
		const friendRequest = await this.getFriendRequestUserById(friendRequestId);
		friendRequest.status = status;

		return this.friendRequestRepository.save(friendRequest);
	}

	async getFriendRequestsFromRecipients(currentUser: User): Promise<FriendRequest[]> {
		return await this.friendRequestRepository.find({
			relations: ["creator", "creator.avatar"],
			where: [{ reciever: currentUser }]
		});
	}
}

import {
	Controller,
	Param,
	Post,
	UseGuards,
	Request,
	Put,
	Get,
	Body,
	InternalServerErrorException,
	NotFoundException
} from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { FriendRequest } from "../entities/friend-request.entity";
import { User } from "../entities/user.entity";
import { FriendRequestStatus } from "../interfaces/friend-request-status.interface";
import { FriendRequestService } from "../services/friend-request.service";
import { UserService } from "../services/user.service";

@Controller("friend-request")
export class FriendRequestController {
	constructor(
		private readonly friendRequestService: FriendRequestService,
		private readonly userService: UserService
	) {}

	@Post("send/:receiverId")
	@UseGuards(JwtGuard)
	async sendFriendRequest(
		@Param("receiverId") receiverStringId: string,
		@Request() req
	): Promise<FriendRequest> {
		const receiverId = parseInt(receiverStringId);
		const creator = req.user;
		let friendRequest: FriendRequest;
		try {
			friendRequest = await this.friendRequestService.sendFriendRequest(
				receiverId,
				creator
			);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
		return friendRequest;
	}

	@Get("status/:receiverId")
	@UseGuards(JwtGuard)
	async getFriendRequestStatus(
		@Param("receiverId") receiverStringId: string,
		@Request() req
	): Promise<FriendRequestStatus> {
		const receiverId = parseInt(receiverStringId);
		let friendRequestStatus: FriendRequestStatus;
		try {
			friendRequestStatus = await this.friendRequestService.getFriendRequestStatus(
				receiverId,
				req.user
			);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
		return friendRequestStatus;
	}

	@Put("response/:friendRequestId")
	@UseGuards(JwtGuard)
	async respondToFriendRequest(
		@Param("friendRequestId") friendRequestStringId: string,
		@Body() statusResponse: FriendRequestStatus
	): Promise<FriendRequestStatus> {
		const friendRequestId = parseInt(friendRequestStringId);
		let friendRequestStatus: FriendRequestStatus;
		try {
			friendRequestStatus = await this.friendRequestService.respondToFriendRequest(
				statusResponse.status,
				friendRequestId
			);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
		return friendRequestStatus;
	}

	@Get("me/received-requests")
	@UseGuards(JwtGuard)
	async getFriendRequestsFromRecipients(@Request() req): Promise<FriendRequest[]> {
		let friendRequests: FriendRequest[];
		try {
			friendRequests =
				await this.friendRequestService.getFriendRequestsFromRecipients(req.user);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
		return friendRequests;
	}

	@Get("me/friends/:id")
	@UseGuards(JwtGuard)
	async getFriends(@Param("id") id: number): Promise<User[]> {
		let friends: User[];
		try {
			friends = await this.userService.findFriendsFromFriendRequests(id);
		} catch (error) {
			if (error.message === "User not found") {
				throw new NotFoundException(error.message);
			}
			throw new InternalServerErrorException(error.message);
		}
		return friends;
	}
}

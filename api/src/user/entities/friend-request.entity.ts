import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FriendRequest_Status } from "../interfaces/friend-request-status.interface";
import { User } from "./user.entity";

@Entity()
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id?: number;

	@ManyToOne(() => User, user => user.sentFriendRequests)
	creator: User;

	@ManyToOne(() => User, user => user.receivedFriendRequests)
	reciever: User;

	@Column()
	status: FriendRequest_Status;
}

import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { FriendRequest_Status } from "../interfaces/friend-request-status.interface";
import { User } from "./user.entity";

@Entity()
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id?: number;

	@ManyToMany(() => User, user => user.sentFriendRequests)
	creator: User;

	@ManyToMany(() => User, user => user.receivedFriendRequests)
	reciever: User;

	@Column()
	status: FriendRequest_Status;
}

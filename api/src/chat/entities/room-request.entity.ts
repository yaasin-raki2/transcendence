import { User } from "src/user/entities/user.entity";
import { FriendRequest_Status } from "src/user/interfaces/friend-request-status.interface";
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn
} from "typeorm";
import { Room } from "./room.entity";

@Entity()
export class RoomRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => User, user => user.sentRoomRequests)
	creator: User;

	@ManyToOne(type => User, user => user.receivedRoomRequests)
	reciever: User;

	@JoinColumn({ name: "roomId" })
	@ManyToOne(type => Room)
	room: Room;

	@Column()
	status: FriendRequest_Status;
}

import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	JoinColumn,
	OneToOne,
	OneToMany
} from "typeorm";
import { DatabaseFile } from "./database-file.entity";
import { FriendRequest } from "./friend-request.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	logging: string;

	@Column()
	username: string;

	@JoinColumn({ name: "avatarId" })
	@OneToOne(() => DatabaseFile, { nullable: true })
	avatar?: DatabaseFile;

	@Column({ nullable: true })
	avatarId?: number;

	@Column({ default: false })
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({ nullable: true })
	twoFactorAuthenticationSecret?: string;

	@OneToMany(type => FriendRequest, friendRequest => friendRequest.creator)
	sentFriendRequests: FriendRequest[];

	@OneToMany(type => FriendRequest, friendRequest => friendRequest.reciever)
	receivedFriendRequests: FriendRequest[];

	@Column({ default: "online" })
	status: string;
}

import { User } from "src/user/entities/user.entity";
import {
	Column,
	Entity,
	JoinColumn,
	PrimaryGeneratedColumn,
	OneToOne,
	ManyToMany,
	JoinTable,
	ManyToOne
} from "typeorm";
import { Room_State } from "../interfaces/room-state.interface";

@Entity()
export class Room {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column()
	state: Room_State;

	@JoinColumn({ name: "adminId" })
	@ManyToOne(type => User)
	admin: User;

	@ManyToMany(type => User, user => user.rooms)
	@JoinTable()
	members: User[];
}

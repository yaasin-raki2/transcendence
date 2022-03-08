import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, OneToOne } from "typeorm";
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
	@OneToOne(() => User)
	admin: User;
}

import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from "typeorm";
import { DatabaseFile } from "./databaseFile.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	logging: string;

	@Column()
	username: string;

	@JoinColumn({ name: "avatarId" })
	@OneToOne(type => DatabaseFile, { nullable: true })
	avatar?: DatabaseFile;

	@Column({ nullable: true })
	avatarId?: number;
}

import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from "typeorm";
import { DatabaseFile } from "./database-file.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	logging: string;

	@Column()
	username: string;

	@JoinColumn({ name: "avatarId" })
	@OneToOne(type => DatabaseFile, { nullable: true })
	avatar?: DatabaseFile;

	@Column({ nullable: true })
	avatarId?: number;

	@Column({ default: false })
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({ nullable: true })
	twoFactorAuthenticationSecret?: string;
}

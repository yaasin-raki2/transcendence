import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository, UpdateResult } from "typeorm";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { DatabaseFile } from "../entities/database-file.entity";
import { User } from "../entities/user.entity";
import { DatabaseFilesService } from "./database-files.service";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly databaseFilesService: DatabaseFilesService,
		private readonly jwtService: JwtService,
		private readonly connection: Connection
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		let user: User;
		user = await this.usersRepository.findOne({
			where: [{ logging: createUserDto.logging }]
		});
		if (user) throw new Error("User already exists");
		user = await this.usersRepository.create(createUserDto);
		return this.usersRepository.save(user);
	}

	async createJwtCredentials(user: User): Promise<string> {
		return this.jwtService.signAsync({ user });
	}

	async findAll(): Promise<User[]> {
		const users = await this.usersRepository.find();
		if (users.length === 0) throw new Error("No users found");
		return users;
	}

	async findOne(id: number): Promise<User> {
		const user = await this.usersRepository.findOne(id);
		if (!user) throw new Error("User not found");
		return user;
	}

	async findOneByLogging(logging: string): Promise<User> {
		const user = await this.usersRepository.findOne({ where: [{ logging }] });
		if (!user) throw new Error("User not found");
		return user;
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.usersRepository.findOne(id);
		if (!user) throw new Error("User not found");
		Object.assign(user, updateUserDto);
		return this.usersRepository.save(user);
	}

	async remove(id: number) {
		const user = await this.usersRepository.findOne(id);
		if (!user) throw new Error("User not found");
		return this.usersRepository.remove(user);
	}

	async addAvatar(
		userId: number,
		imageBuffer: Buffer,
		fileName: string
	): Promise<DatabaseFile> {
		const queryRunner = this.connection.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const user = await queryRunner.manager.findOne(User, userId);
			const currentAvatarId = user.avatarId;
			const avatar =
				await this.databaseFilesService.uploadDatabaseFileWithQueryRunner(
					imageBuffer,
					fileName,
					queryRunner
				);
			await queryRunner.manager.update(User, userId, { avatarId: avatar.id });
			if (currentAvatarId)
				await this.databaseFilesService.deleteFileWithQueryRunner(
					currentAvatarId,
					queryRunner
				);
			await queryRunner.commitTransaction();
			return avatar;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException();
		} finally {
			await queryRunner.release();
		}
	}

	async setTwoFactorAuthenticationSecret(
		secret: string,
		userId: number
	): Promise<UpdateResult> {
		return this.usersRepository.update(userId, {
			twoFactorAuthenticationSecret: secret
		});
	}

	async turnOnTwoFactorAuthentication(userId: number): Promise<UpdateResult> {
		return this.usersRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: true
		});
	}
}

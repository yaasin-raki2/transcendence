import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Connection, Repository } from "typeorm";
import { CreateUserDto } from "../dtos/create-user.dto";
import { DatabaseFile } from "../entities/database-file.entity";
import { User } from "../entities/user.entity";
import { DatabaseFilesService } from "./database-files.service";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly databaseFilesService: DatabaseFilesService,
		private readonly connection: Connection
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		let user: User;
		user = await this.usersRepository.findOne({
			where: [{ logging: createUserDto.logging }]
		});
		if (user) throw new Error("User already exists");
		user = await this.usersRepository.create(createUserDto);
		user = await this.usersRepository.save(user);
		const profileImageBuffer = await this.imageUrlToBuffer(createUserDto.image_url);
		const { id } = await this.addAvatar(
			user.id,
			profileImageBuffer,
			createUserDto.logging
		);
		user.avatarId = id;
		return user;
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

	async update(id: number, updateUserDto: any): Promise<User> {
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

	async getUserWithAvatar(userId: number): Promise<User> {
		const user = await this.usersRepository.findOne(userId, {
			relations: ["avatar"]
		});
		if (!user) throw new Error("User not found");
		return user;
	}

	async imageUrlToBuffer(image_url: string): Promise<Buffer> {
		const { data: image } = await axios.get(image_url, {
			responseType: "arraybuffer"
		});
		const buffer = Buffer.from(image, "utf-8");
		return buffer;
	}

	async findOneWithFriendsRequests(id: number): Promise<User> {
		let user: User;
		try {
			user = await this.usersRepository.findOne(id, {
				relations: [
					"sentFriendRequests",
					"sentFriendRequests.reciever",
					"sentFriendRequests.reciever.avatar",
					"receivedFriendRequests",
					"receivedFriendRequests.creator",
					"receivedFriendRequests.creator.avatar"
				]
			});
		} catch (error) {
			console.log(error);
		}
		if (!user) throw new Error("User not found");
		return user;
	}

	async findFriendsFromFriendRequests(id: number): Promise<User[]> {
		let user: User;
		try {
			user = await this.findOneWithFriendsRequests(id);
		} catch (error) {
			if (error.message === "User not found") {
				throw new Error("User not found");
			} else {
				throw new Error(error.message);
			}
		}
		let friends: User[] = [];
		user.receivedFriendRequests.forEach(friendRequest => {
			if (friendRequest.status === "accepted") {
				friends.push(friendRequest.creator);
			}
		});
		user.sentFriendRequests.forEach(friendRequest => {
			if (friendRequest.status === "accepted") {
				friends.push(friendRequest.reciever);
			}
		});
		return friends;
	}

	async findOneWithRooms(id: number): Promise<User> {
		return await this.usersRepository.findOne(id, { relations: ["rooms"] });
	}
}

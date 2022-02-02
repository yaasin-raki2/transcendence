import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const user = await this.repo.create(createUserDto);
		return this.repo.save(user);
	}

	async findAll(): Promise<User[]> {
		const users = await this.repo.find();
		if (users.length === 0) throw new Error("No users found");
		return users;
	}

	async findOne(id: number): Promise<User> {
		const user = await this.repo.findOne(id);
		if (!user) throw new Error("User not found");
		return this.repo.findOne(id);
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.repo.findOne(id);
		if (!user) throw new Error("User not found");
		Object.assign(user, updateUserDto);
		return this.repo.save(user);
	}

	async remove(id: number) {
		const user = await this.repo.findOne(id);
		if (!user) throw new Error("User not found");
		return this.repo.remove(user);
	}
}

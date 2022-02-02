import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	NotFoundException,
	InternalServerErrorException
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async create(@Body() createUserDto: CreateUserDto): Promise<User> {
		let user: User;
		try {
			user = await this.userService.create(createUserDto);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}

	@Get()
	async findAll(): Promise<User[]> {
		let users: User[];
		try {
			users = await this.userService.findAll();
		} catch (error) {
			if (error.message === "No users found")
				throw new NotFoundException("No users found");
			throw new InternalServerErrorException(error.message);
		}
		return users;
	}

	@Get(":id")
	async findOne(@Param("id") id: string): Promise<User> {
		let user: User;
		try {
			user = await this.userService.findOne(+id);
		} catch (error) {
			if (error.message == "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}

	@Patch(":id")
	async update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto
	): Promise<User> {
		let user: User;
		try {
			user = await this.userService.update(+id, updateUserDto);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}

	@Delete(":id")
	async remove(@Param("id") id: string) {
		let user: User;
		try {
			user = await this.userService.remove(+id);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}
}

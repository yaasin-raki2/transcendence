import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	NotFoundException,
	InternalServerErrorException,
	UseGuards,
	UnauthorizedException,
	UseInterceptors,
	UploadedFile,
	Req
} from "@nestjs/common";
import { UserService } from "../services/user.service";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { User } from "../entities/user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { DatabaseFile } from "../entities/database-file.entity";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { RequestWithUser } from "../../auth/interfaces/request-with-user.interface";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

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
	@UseGuards(JwtGuard)
	async findOne(@Param("id") id: string): Promise<User> {
		let user: User = null;
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
	@UseGuards(JwtGuard)
	async update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto,
		@Req() { user }: RequestWithUser
	): Promise<User> {
		if (user.id !== +id)
			throw new UnauthorizedException("You are not authorized to update this user");
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
	@UseGuards(JwtGuard)
	async remove(
		@Param("id") id: string,
		@Req() { user }: RequestWithUser
	): Promise<User> {
		if (user.id !== +id)
			throw new UnauthorizedException("You are not authorized to delete this user");
		try {
			user = await this.userService.remove(+id);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}

	@Post("avatar")
	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor("file"))
	async addAvatar(
		@UploadedFile() file: Express.Multer.File,
		@Req() { user }: RequestWithUser
	): Promise<DatabaseFile> {
		return this.userService.addAvatar(user.id, file.buffer, file.originalname);
	}
}

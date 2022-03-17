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
	Req,
	Res,
	StreamableFile
} from "@nestjs/common";
import { UserService } from "../services/user.service";
import { User } from "../entities/user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { DatabaseFile } from "../entities/database-file.entity";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { RequestWithUser } from "../../auth/interfaces/request-with-user.interface";
import { Response } from "express";
import { Readable } from "stream";
import { readFileSync } from "fs";

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

	@Get("/:id/rooms")
	async getUserWithRooms(@Param("id") id: string): Promise<User> {
		let user: User = null;
		try {
			user = await this.userService.findOneWithRooms(+id);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}

	@Get("me")
	@UseGuards(JwtGuard)
	getMe(@Req() req: RequestWithUser): User {
		return req.user;
	}

	@Get("all-relations/:id")
	@UseGuards(JwtGuard)
	async getUserWithAllRelations(@Param("id") id: string): Promise<User> {
		let user: User = null;
		try {
			user = await this.userService.findOneWithAllRelations(+id);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}

	@Get("me/avatar")
	@UseGuards(JwtGuard)
	async getAvatar(
		@Req() req: RequestWithUser,
		@Res({ passthrough: true }) res: Response
	): Promise<any> {
		const user = await this.userService.getUserWithAvatar(req.user.id);

		let avatar: Readable | Buffer | any;

		if (!user.avatar)
			avatar = readFileSync(
				"/Users/yerraqui/v/transcendence/api/assets/default_avatar.png"
			);
		else avatar = Readable.from(user.avatar.data);

		res.set({
			"Content-Disposition": `inline; filename="${user.logging}"`,
			"Content-Type": "image"
		});

		return new StreamableFile(avatar);

		// TODO: Retrieving avatar from database should be done using streams
		// !: read https://wanago.io/2021/11/01/api-nestjs-storing-files-postgresql-database/

		// ?: 42 changed how they display images, you have to be logged in to intra in order to see it, we're fucked up, re architect the whole shit hhh
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
		@Body() updateUserDto: any,
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
		@UploadedFile() file,
		@Req() req: RequestWithUser
	): Promise<DatabaseFile> {
		return this.userService.addAvatar(req.user.id, file.buffer, file.originalname);
	}

	@Get("avatar/:id")
	async getUserWithAvatar(@Param("id") id: string): Promise<User> {
		let user: User = null;
		try {
			user = await this.userService.getUserWithAvatar(+id);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return user;
	}

	// TODO:: Edit the way you return images from buffers to streams
	// TODO: Instead of returning the user with avatar in an object, stream the avatar
}

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
	Session,
	Query,
	UnauthorizedException,
	Res,
	UseInterceptors,
	UploadedFile
} from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { AuthGuard } from "../guards/auth-guard.guard";
import { Response } from "express";
import axios from "axios";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { DatabaseFile } from "../entities/databaseFile.entity";

interface Iintra {
	data: {
		access_token: string;
		token_type: string;
		expires_in: number;
		refresh_token: string;
		scope: string;
		created_at: Date;
	};
}

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("oauth/signup")
	oauthSignup(@Res() res: Response) {
		res.redirect(
			`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.INTRA_UID}&redirect_uri=${process.env.INTRA_REDIRECT_URI}&response_type=code&state=signup`
		);
	}

	@Get("oauth/login")
	oauthLogin(@Res() res: Response) {
		res.redirect(
			`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.INTRA_UID}&redirect_uri=${process.env.INTRA_REDIRECT_URI}&response_type=code&state=login`
		);
	}

	@Get("loginXsignup")
	async signup(
		@Session() session: Record<string, any>,
		@Query("code") code: string,
		@Query("state") state: string
	): Promise<User> {
		const { data }: Iintra = await axios.post(
			`https://api.intra.42.fr/oauth/token?grant_type=authorization_code&client_id=${process.env.INTRA_UID}&client_secret=${process.env.INTRA_SECRET}&code=${code}&redirect_uri=${process.env.INTRA_REDIRECT_URI}&state=${state}`
		);
		const token = data.access_token;
		const { data: student } = await axios.get("https://api.intra.42.fr/v2/me", {
			headers: { Authorization: `Bearer ${token}` }
		});
		let user: User;
		if (state === "signup") {
			const createUserDto: CreateUserDto = {
				logging: student.login,
				username: student.first_name
			};
			try {
				user = await this.userService.create(createUserDto);
			} catch (error) {
				if (error.message === "User already exists")
					throw new UnauthorizedException("User already exists");
				else throw new InternalServerErrorException(error.message);
			}
			session.id = user.id;
			return user;
		} else if (state === "login") {
			const logging = student.login;
			try {
				user = await this.userService.findOneByLogging(logging);
			} catch (error) {
				if (error.message === "User not found")
					throw new NotFoundException("User not found");
				else throw new InternalServerErrorException(error.message);
			}
			session.id = user.id;
			return user;
		}
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
	@UseGuards(AuthGuard)
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
	@UseGuards(AuthGuard)
	async update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto,
		@Session() session: { id: string }
	): Promise<User> {
		if (session.id != id)
			throw new UnauthorizedException("You are not authorized to update this user");
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
	@UseGuards(AuthGuard)
	async remove(
		@Param("id") id: string,
		@Session() session: { id: string }
	): Promise<User> {
		if (session.id !== id)
			throw new UnauthorizedException("You are not authorized to delete this user");
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

	@Post("avatar")
	@UseGuards(AuthGuard)
	@UseInterceptors(FileInterceptor("file"))
	async addAvatar(
		@UploadedFile() file: Express.Multer.File,
		@Session() session: { id: string }
	): Promise<DatabaseFile> {
		let user: User;
		try {
			user = await this.userService.findOne(+session.id);
		} catch (error) {
			if (error.message === "User not found")
				throw new NotFoundException("User not found");
			else throw new InternalServerErrorException(error.message);
		}
		return this.userService.addAvatar(user.id, file.buffer, file.originalname);
	}
}

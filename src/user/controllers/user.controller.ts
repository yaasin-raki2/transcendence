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
	UploadedFile,
	Req,
	BadRequestException,
	HttpCode
} from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { User } from "../entities/user.entity";
import { Response } from "express";
import axios from "axios";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { DatabaseFile } from "../entities/database-file.entity";
import { Intra } from "../interfaces/intra.interface";
import { JwtGuard } from "../guards/jwt.guard";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { PostgresErrorCode } from "../enums/postgres-error-code.enum";
import { TwoFactorAuthenticationService } from "../services/two-factor-authentication.service";

@Controller("user")
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly twFactorAuthenticationService: TwoFactorAuthenticationService
	) {}

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
	@HttpCode(200)
	async signup(
		@Query("code") code: string,
		@Query("state") state: string,
		@Res() res: Response
	): Promise<Response<any, Record<string, any>>> {
		const { data }: Intra = await axios.post(
			`https://api.intra.42.fr/oauth/token?grant_type=authorization_code&client_id=${process.env.INTRA_UID}&client_secret=${process.env.INTRA_SECRET}&code=${code}&redirect_uri=${process.env.INTRA_REDIRECT_URI}&state=${state}`
		);
		const token = data.access_token;
		const { data: student } = await axios.get("https://api.intra.42.fr/v2/me", {
			headers: { Authorization: `Bearer ${token}` }
		});
		let user: User;
		let jwtToken: string;
		if (state === "signup") {
			const createUserDto: CreateUserDto = {
				logging: student.login,
				username: student.first_name
			};
			try {
				user = await this.userService.create(createUserDto);
				jwtToken =
					await this.twFactorAuthenticationService.getCookieWithJwtAccessToken(
						user.id
					);
			} catch (error) {
				if (error?.message === "User already exists")
					throw new UnauthorizedException("User already exists");
				else if (error?.code === PostgresErrorCode.UniqueViolation)
					throw new BadRequestException("User with that email already exists");
				else throw new InternalServerErrorException(error.message);
			}
		} else if (state === "login") {
			const logging = student.login;
			try {
				user = await this.userService.findOneByLogging(logging);
				jwtToken =
					await this.twFactorAuthenticationService.getCookieWithJwtAccessToken(
						user.id
					);
			} catch (error) {
				if (error.message === "User not found")
					throw new NotFoundException("User not found");
				else throw new InternalServerErrorException(error.message);
			}
		}
		res.setHeader("Set-Cookie", jwtToken);
		return res.send(user);
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

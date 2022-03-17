import {
	BadRequestException,
	Body,
	Controller,
	InternalServerErrorException,
	NotFoundException,
	Post,
	Res,
	UnauthorizedException
} from "@nestjs/common";
import { PostgresErrorCode } from "src/enums/postgres-error-code.enum";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/services/user.service";
import { AuthService } from "../services/auth.service";
import { Response } from "express";

@Controller("auth-mock")
export class AuthMockController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService
	) {}

	@Post("sign-up")
	async signIn(@Body() student: CreateUserDto, @Res() res: Response): Promise<any> {
		let user: User;
		let jwtToken: string;
		try {
			user = await this.userService.create(student);
			jwtToken = await this.authService.getCookieWithJwtAccessToken(user.id);
		} catch (error) {
			if (error?.message === "User already exists")
				throw new UnauthorizedException("User already exists");
			else if (error?.code === PostgresErrorCode.UniqueViolation)
				throw new BadRequestException("User with that login already exists");
			else throw new InternalServerErrorException(error.message);
		}
		res.setHeader("Set-Cookie", jwtToken);
	}

	@Post("login")
	async login(@Body() dto: { logging: string }, @Res() res: Response): Promise<any> {
		let user: User;
		let jwtToken: string;
		try {
			user = await this.userService.findOneByLogging(dto.logging);
			jwtToken = await this.authService.getCookieWithJwtAccessToken(user.id);
		} catch (error) {
			if (error?.message === "User not found")
				throw new NotFoundException("User not found");
			throw new InternalServerErrorException(error.message);
		}
		res.setHeader("Set-Cookie", jwtToken);
		res.send(jwtToken);
	}
}

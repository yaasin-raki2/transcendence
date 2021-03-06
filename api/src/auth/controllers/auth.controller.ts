import {
	Controller,
	Get,
	Res,
	HttpCode,
	Query,
	UnauthorizedException,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
	Post,
	Req
} from "@nestjs/common";
import axios from "axios";
import { Request, Response } from "express";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { User } from "src/user/entities/user.entity";
import { PostgresErrorCode } from "src/enums/postgres-error-code.enum";
import { Intra } from "src/auth/interfaces/intra.interface";
import { UserService } from "src/user/services/user.service";
import { AuthService } from "../services/auth.service";

@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService
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
	): Promise<void> {
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
				jwtToken = await this.authService.getCookieWithJwtAccessToken(user.id);
			} catch (error) {
				if (error?.message === "User already exists")
					throw new UnauthorizedException("User already exists");
				else if (error?.code === PostgresErrorCode.UniqueViolation)
					throw new BadRequestException("User with that login already exists");
				else throw new InternalServerErrorException(error.message);
			}
		} else if (state === "login") {
			const logging = student.login;
			try {
				user = await this.userService.findOneByLogging(logging);
				jwtToken = await this.authService.getCookieWithJwtAccessToken(user.id);
			} catch (error) {
				if (error.message === "User not found")
					throw new NotFoundException("User not found");
				else throw new InternalServerErrorException(error.message);
			}
		}
		res.setHeader("Set-Cookie", jwtToken);
		res.redirect("http://localhost:4000/");
	}

	@Post("logout")
	logout(@Res() res: Response): Response {
		res.setHeader("Set-Cookie", this.authService.getCookieForLogOut());
		return res.sendStatus(200);
	}
}

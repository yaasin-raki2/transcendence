import {
	Body,
	Controller,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards
} from "@nestjs/common";
import { Response } from "express";
import { TwofactorAuthenticationDto } from "../dtos/two-factor-authentication-code.dto";
import { User } from "../entities/user.entity";
import { JwtGuard } from "../guards/jwt.guard";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { TwoFactorAuthenticationService } from "../services/two-factor-authentication.service";
import { UserService } from "../services/user.service";

@Controller("2fa")
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService
	) {}

	@Post("generate")
	@UseGuards(JwtGuard)
	async register(
		@Res() response: Response,
		@Req() { user }: RequestWithUser
	): Promise<any> {
		const { otpauthUrl } =
			await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
				user
			);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}

	@Post("turn-on")
	@HttpCode(200)
	@UseGuards(JwtGuard)
	async turnOnTwoFactorAuthentication(
		@Body() { code2fa }: TwofactorAuthenticationDto,
		@Req() { user }: RequestWithUser
	): Promise<void> {
		const isCodeValid =
			this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
				code2fa,
				user
			);
		if (!isCodeValid) throw new UnauthorizedException("Wrong authentication code");
		await this.userService.turnOnTwoFactorAuthentication(user.id);
	}

	@Post("authenticate")
	@HttpCode(200)
	@UseGuards(JwtGuard)
	authenticate(
		@Req() req: RequestWithUser,
		@Body() { code2fa }: TwofactorAuthenticationDto
	): User {
		const isCodeValid =
			this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
				code2fa,
				req.user
			);
		if (!isCodeValid) throw new UnauthorizedException("Wrong authentication code");
		const accessTokenCookie =
			this.twoFactorAuthenticationService.getCookieWithJwtAccessToken(
				req.user.id,
				true
			);
		req.res.setHeader("Set-Cookie", [accessTokenCookie]);
		return req.user;
	}
}

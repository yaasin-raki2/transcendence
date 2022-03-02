import {
	Body,
	Controller,
	forwardRef,
	Get,
	HttpCode,
	Inject,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards
} from "@nestjs/common";
import { Response } from "express";
import { TwofactorAuthenticationDto } from "../../user/dtos/two-factor-authentication-code.dto";
import { User } from "../../user/entities/user.entity";
import { JwtGuard } from "../guards/jwt.guard";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { TwoFactorAuthenticationService } from "../services/two-factor-authentication.service";
import { UserService } from "../../user/services/user.service";
import { AuthService } from "../services/auth.service";

@Controller("2fa")
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly authService: AuthService
	) {}

	@Get("generate")
	@UseGuards(JwtGuard)
	async register(@Res() response: Response, @Req() { user }: RequestWithUser) {
		const { otpauthUrl } =
			await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
				user
			);
		//return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
		response.send(otpauthUrl);
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
		await this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(user.id);
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
		const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
			req.user.id,
			true
		);
		req.res.setHeader("Set-Cookie", [accessTokenCookie]);
		return req.user;
	}

	@Post("turn-off")
	@HttpCode(200)
	@UseGuards(JwtGuard)
	async turnOffTwoFactorAuthentication(
		@Req() { user }: RequestWithUser
	): Promise<void> {
		await this.twoFactorAuthenticationService.turnOffTwoFactorAuthentication(user.id);
	}
}

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../../user/entities/user.entity";
import { TokenPayload } from "../interfaces/token-payload.interface";
import { UserService } from "../../user/services/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	url: string;

	constructor(private readonly userService: UserService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => {
					this.url = req.url;
					return req?.cookies?.Authentication;
				}
			]),
			secretOrKey: process.env.JWT_SECRET
		});
	}

	async validate(payload: TokenPayload) {
		let user: User;
		try {
			user = await this.userService.findOne(payload.userId);
		} catch (error) {
			throw new InternalServerErrorException();
		}
		if (
			!user.isTwoFactorAuthenticationEnabled ||
			payload.isSecondFactorAuthenticated ||
			this.url === "/api/2fa/authenticate" ||
			this.url === "/api/2fa/turn-off" ||
			this.url === "/api/user/me"
		)
			return user;
	}
}

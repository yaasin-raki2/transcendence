import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { TokenPayload } from "../interfaces/token-payload.interface";
import { UserService } from "../services/user.service";

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
		console.log(this.url);
		console.log(payload);
		let user: User;
		try {
			user = await this.userService.findOne(payload.userId);
		} catch (error) {
			throw new InternalServerErrorException();
		}
		if (!user.isTwoFactorAuthenticationEnabled) return user;
		if (payload.isSecondFactorAuthenticated) return user;
		if (this.url === "/api/2fa/authenticate") return user;
	}
}

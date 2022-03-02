import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/user/entities/user.entity";
import { TokenPayload } from "src/auth/interfaces/token-payload.interface";

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

	async createJwtCredentials(user: User): Promise<string> {
		return this.jwtService.signAsync({ user });
	}

	getCookieWithJwtAccessToken(
		userId: number,
		isSecondFactorAuthenticated: boolean = false
	): string {
		const payload: TokenPayload = {
			userId,
			isSecondFactorAuthenticated
		};
		const token = this.jwtService.sign(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: process.env.JWT_EXPIRATION_TIME
		});
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME}`;
	}

	getCookieForLogOut(): string {
		return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
	}
}

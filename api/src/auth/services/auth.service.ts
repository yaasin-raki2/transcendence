import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/user/entities/user.entity";
import { TokenPayload } from "src/auth/interfaces/token-payload.interface";
import { UserService } from "src/user/services/user.service";
import { Socket } from "socket.io";
import { parse } from "cookie";

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService
	) {}

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

	getUserFromAuthenticationToken(token: string): Promise<User> {
		const payload: TokenPayload = this.jwtService.verify(token, {
			secret: process.env.JWT_ACCESS_TOKEN_SECRET
		});
		if (payload.userId) return this.userService.findOne(payload.userId);
	}

	async getUserFromSocket(socket: Socket): Promise<User | null> {
		const cookie = socket.handshake.headers.cookie;
		if (!cookie) throw new Error("Invalid credentials.");
		const { Authentication: authenticationToken } = parse(cookie);
		const user = await this.getUserFromAuthenticationToken(authenticationToken);
		if (!user) throw new Error("Unauthorized");
		return user;
	}
}

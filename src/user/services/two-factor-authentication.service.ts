import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { authenticator } from "otplib";
import { User } from "../entities/user.entity";
import { UserService } from "./user.service";
import { toFileStream } from "qrcode";
import { TokenPayload } from "../interfaces/token-payload.interface";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async generateTwoFactorAuthenticationSecret(
		user: User
	): Promise<{ secret: string; otpauthUrl: string }> {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.logging,
			process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
			secret
		);
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
		return {
			secret,
			otpauthUrl
		};
	}

	async pipeQrCodeStream(stream: Response, otpauthUrl: string): Promise<any> {
		return toFileStream(stream, otpauthUrl);
	}

	isTwoFactorAuthenticationCodeValid(code2fa: string, user: User) {
		return authenticator.verify({
			token: code2fa,
			secret: user.twoFactorAuthenticationSecret
		});
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
}

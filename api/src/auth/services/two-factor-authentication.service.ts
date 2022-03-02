import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { authenticator } from "otplib";
import { User } from "../../user/entities/user.entity";
import { UserService } from "../../user/services/user.service";
import { toFileStream } from "qrcode";

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(private readonly userService: UserService) {}

	async generateTwoFactorAuthenticationSecret(
		user: User
	): Promise<{ secret: string; otpauthUrl: string }> {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.logging,
			process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
			secret
		);
		await this.setTwoFactorAuthenticationSecret(secret, user.id);
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

	async setTwoFactorAuthenticationSecret(
		secret: string,
		userId: number
	): Promise<User> {
		let user: User;
		try {
			user = await this.userService.update(userId, {
				twoFactorAuthenticationSecret: secret
			});
		} catch (error) {
			throw new Error("User not found");
		}
		return user;
	}

	async turnOnTwoFactorAuthentication(userId: number): Promise<User> {
		let user: User;
		try {
			user = await this.userService.update(userId, {
				isTwoFactorAuthenticationEnabled: true
			});
		} catch (error) {
			throw new Error("User not found");
		}
		return user;
	}

	async turnOffTwoFactorAuthentication(userId: number): Promise<User> {
		let user: User;
		try {
			user = await this.userService.update(userId, {
				isTwoFactorAuthenticationEnabled: false,
				twoFactorAuthenticationSecret: null
			});
		} catch (error) {
			throw new Error("User not found");
		}
		return user;
	}
}

import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { AuthService } from "src/auth/services/auth.service";
import { UserService } from "src/user/services/user.service";
import { parse } from "cookie";
import { WsException } from "@nestjs/websockets";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class ChatService {
	constructor(private readonly authService: AuthService) {}
	async getUserFromSocket(socket: Socket): Promise<User | null> {
		const cookie = socket.handshake.headers.cookie;
		if (!cookie) throw new Error("Invalid credentials.");
		const { Authentication: authenticationToken } = parse(cookie);
		const user = await this.authService.getUserFromAuthenticationToken(
			authenticationToken
		);
		if (!user) throw new Error("Unauthorized");
		return user;
	}
}

import { Module } from "@nestjs/common";
import { ChatService } from "./services/chat.service";
import { ChatGateway } from "./chat.gateway";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/services/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room } from "./entities/room.entity";
import { ChatController } from "./controllers/chat.controller";
import { RoomController } from "./controllers/room.controller";
import { RoomRequestController } from "./controllers/room-request.controller";
import { RoomRequestService } from "./services/room-request.service";
import { RoomService } from "./services/room.service";
import { RoomRequest } from "./entities/room-request.entity";
import { UserService } from "src/user/services/user.service";

@Module({
	imports: [
		UserModule,
		AuthModule,
		JwtModule.registerAsync({
			useFactory: () => ({
				secret: process.env.JWT_SECRET,
				signOptions: {
					expiresIn: process.env.JWT_EXPIRATION_TIME
				}
			})
		}),
		TypeOrmModule.forFeature([Room, RoomRequest])
	],
	controllers: [ChatController, RoomController, RoomRequestController],
	providers: [
		ChatGateway,
		ChatService,
		AuthService,
		RoomService,
		RoomRequestService,
		UserService
	]
})
export class ChatModule {}

import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/services/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room } from "./entities/room.entity";
import { ChatController } from "./chat.controller";

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
		TypeOrmModule.forFeature([Room])
	],
	controllers: [ChatController],
	providers: [ChatGateway, ChatService, AuthService]
})
export class ChatModule {}

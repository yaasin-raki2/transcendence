import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { DatabaseFile } from "./entities/database-file.entity";
import { DatabaseFilesService } from "./services/database-files.service";
import { DatabaseFilesController } from "./controllers/database-files.controller";
import { TwoFactorAuthenticationService } from "../auth/services/two-factor-authentication.service";
import { TwoFactorAuthenticationController } from "../auth/controllers/two-factor-authentication.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { JwtStrategy } from "../auth/guards/jwt.strategy";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: () => ({
				secret: process.env.JWT_SECRET,
				signOptions: {
					expiresIn: process.env.JWT_EXPIRATION_TIME
				}
			})
		}),
		TypeOrmModule.forFeature([User, DatabaseFile]),
		forwardRef(() => AuthModule)
	],
	controllers: [
		UserController,
		DatabaseFilesController,
		TwoFactorAuthenticationController
	],
	providers: [
		UserService,
		DatabaseFilesService,
		TwoFactorAuthenticationService,
		JwtGuard,
		JwtStrategy
	],
	exports: [
		TypeOrmModule.forFeature([User, DatabaseFile]),
		UserService,
		DatabaseFilesService
	]
})
export class UserModule {}

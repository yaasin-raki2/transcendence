import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/services/user.service";
import { JwtModule } from "@nestjs/jwt";
import { TwoFactorAuthenticationService } from "./services/two-factor-authentication.service";
import { AuthMockController } from "./mocks/auth.controller.mock";

@Module({
	imports: [
		forwardRef(() => UserModule),
		JwtModule.registerAsync({
			useFactory: () => ({
				secret: process.env.JWT_SECRET,
				signOptions: {
					expiresIn: process.env.JWT_EXPIRATION_TIME
				}
			})
		})
	],
	controllers: [AuthController, AuthMockController],
	providers: [AuthService, UserService, TwoFactorAuthenticationService],
	exports: [AuthService, TwoFactorAuthenticationService]
})
export class AuthModule {}

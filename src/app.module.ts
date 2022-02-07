import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CookieSessionModule } from "nestjs-cookie-session";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		//CookieSessionModule.forRoot({
		//	session: {
		//		name: "session",
		//		secret: process.env.COOKIE_SECRET
		//	}
		//}),
		TypeOrmModule.forRoot({
			type: "postgres",
			host: process.env.POSTGRES_HOST,
			port: parseInt(<string>process.env.POSTGRES_PORT),
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DATABASE,
			autoLoadEntities: true,
			synchronize: process.env.production ? false : true
		}),
		UserModule
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				whitelist: true
			})
		},
		AppService
	]
})
export class AppModule {}

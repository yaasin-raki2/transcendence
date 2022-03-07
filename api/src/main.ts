import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";

class SocketAdapter extends IoAdapter {
	createIOServer(
		port: number,
		options?: ServerOptions & {
			namespace?: string;
			server?: any;
		}
	) {
		const server = super.createIOServer(port, { ...options, cors: { 
			origin: "http://localhost:4000",
			credentials: true
		  }  });
		return server;
	}
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: "http://localhost:4000",
			credentials: true
		}
	});
	app.setGlobalPrefix("api");
	app.use(cookieParser());
	app.useWebSocketAdapter(new SocketAdapter(app));
	await app.listen(3000);
}
bootstrap();

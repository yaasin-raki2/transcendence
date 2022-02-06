import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { DatabaseFile } from "./entities/databaseFile.entity";
import { DatabaseFilesService } from "./services/database-files.service";
import { DatabaseFilesController } from './controllers/database-files.controller';

@Module({
	imports: [TypeOrmModule.forFeature([User, DatabaseFile])],
	controllers: [UserController, DatabaseFilesController],
	providers: [UserService, DatabaseFilesService]
})
export class UserModule {}

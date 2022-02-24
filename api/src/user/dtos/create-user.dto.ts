import { IsString } from "class-validator";

export class CreateUserDto {
	@IsString()
	logging: string;

	@IsString()
	username: string;

	@IsString()
	image_url: string;
}

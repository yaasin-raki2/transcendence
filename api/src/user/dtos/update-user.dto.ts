import { IsString } from "class-validator";

export class UpdateUserDto {
	@IsString()
	uername: string;
}

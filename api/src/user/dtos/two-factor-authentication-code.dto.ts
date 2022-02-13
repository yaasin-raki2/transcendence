import { IsString } from "class-validator";

export class TwofactorAuthenticationDto {
	@IsString()
	code2fa: string;
}

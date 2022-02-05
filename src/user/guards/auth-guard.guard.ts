import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserService } from "../user.service";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const { session } = await context.switchToHttp().getRequest();
		if (session.id)
			return (await this.userService.findOne(session.id)) ? true : false;

		return false;
	}
}

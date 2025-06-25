import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('[APP-STAFF] Users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}
}

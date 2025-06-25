import { CheckProofRequestDto } from '@modules/auth/dto/check-proof.dto';
import { UpdateInfoDto } from '@modules/auth/dto/update-info.dto';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { User } from '@modules/users/entities/user.entity';
import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { Public } from 'src/decorators/auth.decorator';
import { RequestWithUser } from 'src/types/requests.type';
import { AppResponse } from '../../types/common.type';
import { AuthService } from './auth.service';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('health-check')
	@Public()
	async handleHealthCheck() {
		return { success: true };
	}

	@Post('sign-in')
	@ApiBody({
		type: CheckProofRequestDto,
	})
	@ApiTags('[APP Admins] Auth')
	@ApiTags('[APP User] Auth')
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request',
				},
			},
		},
	})
	async signIn(@Body() loginDto: CheckProofRequestDto) {
		return await this.authService.signIn(loginDto);
	}

	@Post('sign-out')
	@ApiBody({
		type: CheckProofRequestDto,
	})
	@ApiTags('[APP Admins] Auth')
	@ApiTags('[APP User] Auth')
	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request',
				},
			},
		},
	})
	async signOut(@Req() request: RequestWithUser) {
		const user = request.user;
		return await this.authService.signOut(user);
	}

	@ApiBearerAuth('token')
	@ApiTags('[APP Admins] Auth')
	@ApiTags('[APP Staff] Auth')
	@UseGuards(JwtRefreshTokenGuard)
	@Post('refresh')
	async refreshAccessToken(@Req() request: Request, @Res() res: Response) {
		return this.authService.refreshAccessToken(request, res);
	}

	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	@Post('log-out')
	@ApiTags('[APP Admins] Auth')
	@ApiTags('[APP Staff] Auth')
	@ApiOperation({
		summary: 'User logout',
		description: '## User logout',
	})
	async logOut(
		@Req() request: any,
	): Promise<AppResponse<any> | Observable<never>> {
		return await this.authService.logOut(request);
	}

	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	@Post('update-info')
	@ApiOperation({
		summary: 'User update info, username',
		description: '## User update info, username',
	})
	@ApiBody({
		type: UpdateInfoDto,
	})
	@ApiResponse({ type: AppResponse<User> })
	async updateInfo(
		@Req() request: RequestWithUser,
		@Body() dto: UpdateInfoDto,
	): Promise<AppResponse<User> | Observable<never>> {
		const { user } = request;
		return await this.authService.updateInfo(user, dto);
	}

	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	@Get('me')
	@ApiOperation({
		summary: 'Get user info',
		description: '## User info',
	})
	@ApiResponse({ type: AppResponse<User> })
	async getMe(
		@Req() request: RequestWithUser,
	): Promise<AppResponse<User> | Observable<never>> {
		const { user } = request;
		return {
			data: user,
		};
	}
}

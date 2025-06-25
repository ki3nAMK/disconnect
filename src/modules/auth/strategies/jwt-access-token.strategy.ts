import { UsersService } from '@modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { accessTokenPublicKey } from 'src/constraints/jwt.constraint';
import { EStatusUser } from '@modules/users/enums/index.enum';
import { TokenPayload } from '@modules/auth/interfaces';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			// jwtFromRequest: ExtractJwt.fromExtractors([
			// 	(req: Request) => {
			// 		return req?.cookies['accessToken']; // Extract JWT from cookies
			// 	},
			// ]),
			ignoreExpiration: false,
			secretOrKey: accessTokenPublicKey,
		});
	}

	async validate({ uuidAccessToken, userId }: TokenPayload) {
		const user = await this.usersService.getUserWithRole(userId);

		if (!user) {
			throw new UnauthorizedException('auths.Account not found');
		}

		if (user?.deletedAt) {
			throw new UnauthorizedException('auths.Account is deleted');
		}

		if (user?.status === EStatusUser.INACTIVE) {
			throw new UnauthorizedException('auths.Account inactive');
		}

		// if (user.currentAccessToken !== uuidAccessToken && user.role === ERolesUser.USER)
		// 	throw new UnauthorizedException(
		// 		'auths.Account is signed in on another device',
		// 	);

		return user;
	}
}

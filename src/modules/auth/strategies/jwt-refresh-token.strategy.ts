import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { refreshTokenPublicKey } from 'src/constraints/jwt.constraint';
import { RefreshTokenInterface } from '@modules/auth/interfaces/refresh-token.interface';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'refreshToken',
) {
	constructor(private readonly authService: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: refreshTokenPublicKey,
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: RefreshTokenInterface) {
		request['payloadJwt'] = payload;

		return await this.authService.getUserIfRefreshTokenMatched(
			payload.userId,
			payload.uuidRefreshToken,
		);
	}
}

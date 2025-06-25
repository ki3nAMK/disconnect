import { TokenPayload } from '@modules/auth/interfaces';
import { CacheDomain } from '@modules/cache/cache-domain.service';
import { ERolesUser, EStatusUser } from '@modules/users/enums/index.enum';
import { UsersService } from '@modules/users/users.service';
import {
	HttpStatus,
	INestApplicationContext,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { NextFunction } from 'express';
import { get } from 'lodash';
import { Server, ServerOptions } from 'socket.io';
import { accessTokenPublicKey } from 'src/constraints/jwt.constraint';
import { CustomSocket, SocketNamespace } from 'src/types/socket.type';

export class RedisIoAdapter extends IoAdapter {
	logger = new Logger(RedisIoAdapter.name);
	private adapterConstructor: ReturnType<typeof createAdapter>;

	constructor(
		private app: INestApplicationContext,
		private readonly cacheDomain: CacheDomain,
	) {
		super(app);
	}

	async connectToRedis(): Promise<void> {
		const pubClient = this.cacheDomain.getRedisClient();
		const subClient = pubClient.duplicate();

		this.adapterConstructor = createAdapter(pubClient, subClient);
	}

	createTokenMiddleware(
		jwtService: JwtService,
		usersService: UsersService,
		role?: ERolesUser,
	) {
		return async (socket: CustomSocket, next: NextFunction) => {
			const token = get(socket, 'handshake.query.token', '') as string;

			if (!token) {
				next(
					new UnauthorizedException({
						statusCode: HttpStatus.UNAUTHORIZED,
					}),
				);

				return;
			}

			try {
				const payload = jwtService.verify(token, {
					secret: accessTokenPublicKey,
				}) as TokenPayload;

				const user = await usersService.getUserWithRole(payload.userId);

				if (!user) {
					throw new UnauthorizedException('Account not found');
				}

				if (user?.deletedAt) {
					throw new UnauthorizedException('Account is deleted');
				}

				if (user?.status === EStatusUser.INACTIVE) {
					throw new UnauthorizedException('Account inactive');
				}

				socket.handshake.currentUserId = payload.userId;

				next();
			} catch (error) {
				console.log('error', error);
				next(error);
			}
		};
	}

	createIOServer(port: number, options?: ServerOptions): any {
		const server: Server = super.createIOServer(port, options);

		const jwtService = this.app.get(JwtService);
		const usersService = this.app.get(UsersService);

		server
			.of(SocketNamespace.CLIENT_NOTIFICATION)
			.use(this.createTokenMiddleware(jwtService, usersService));

		server
			.of(SocketNamespace.IN_GAME)
			.use(this.createTokenMiddleware(jwtService, usersService));

		server.adapter(this.adapterConstructor);

		return server;
	}
}

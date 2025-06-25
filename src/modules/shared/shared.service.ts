import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SharedService {
	private client: Redis;

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly eventEmitter: EventEmitter2,
	) {
		const password = this.configService.get<string>('REDIS_PASSWORD');

		this.client = new Redis({
			host: this.configService.get('REDIS_HOST', 'localhost'),
			port: this.configService.get<number>('REDIS_PORT', 6379),
			username: '',
			password,
		});
	}

	private readonly BLACKLIST_PREFIX = 'blacklist-token:';

	async storeUserAccessToken(userId: string, newToken: string): Promise<void> {
		// store access token of user when login success
		const redisKey = `user:${userId}:access_token`;

		const oldToken = await this.client.get(redisKey);
		if (oldToken) {
			console.log('oldToken exist');

			await this.addTokenToBlacklist(oldToken);
			this.eventEmitter.emit('session.newDevice', { token: oldToken });
		}

		const expirationDate = this.getExpirationDate(newToken);
		if (!expirationDate) {
			console.error('Could not retrieve expiration date for new token.');
			return;
		}

		const ttl = Math.max(
			0,
			Math.floor((expirationDate.getTime() - Date.now()) / 1000),
		);

		await this.client.set(redisKey, newToken, 'EX', ttl);
	}

	async addTokenToBlacklist(token: string) {
		const expirationDate = this.getExpirationDate(token);
		const key = this.BLACKLIST_PREFIX + token;

		if (expirationDate) {
			const ttl = Math.max(
				0,
				Math.floor((expirationDate.getTime() - Date.now()) / 1000),
			); // Calculate TTL in seconds
			await this.client.set(key, `${expirationDate}`, 'EX', ttl);
		} else {
			console.error('Could not retrieve expiration date for token.');
		}
	}

	async isTokenBlacklisted(token: string): Promise<any> {
		return this.client.get(this.BLACKLIST_PREFIX + token);
	}

	private getExpirationDate(token: string): Date | null {
		try {
			const decodedToken = this.jwtService.decode(token) as { exp: number };

			if (decodedToken && decodedToken.exp) {
				return new Date(decodedToken.exp * 1000); // Convert Unix timestamp to Date
			}
			return null; // Token doesn't have an expiration date
		} catch (error) {
			console.error('Error decoding token:', error);
			return null; // Handle error (e.g., invalid token)
		}
	}
}

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

@Injectable()
export class CacheDomain {
	logger = new Logger(CacheDomain.name);

	private redisClients: Redis;

	constructor(
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		private readonly configService: ConfigService,
	) {
		const host = configService.get<string>('REDIS_HOST');
		const database = configService.get<number>('REDIS_DB');
		const password = configService.get<string>('REDIS_PASSWORD');
		const port = configService.get<number>('REDIS_PORT');

		this.redisClients = new Redis({
			host,
			port,
			db: database,
			password,
			username: '',
		});

		this.redisClients.on('connect', () =>
			this.logger.log('Connected to Redis'),
		);
		this.redisClients.on('error', (err) =>
			this.logger.error('Redis Error:', err),
		);
	}

	getRedisClient() {
		return this.redisClients;
	}

	getCacheManager() {
		return this.cacheManager;
	}

	async setTnx(key: string, value: any, ttl?: number): Promise<void> {
		const multi = this.redisClients.multi();

		try {
			// Watch key for transactions
			await this.redisClients.watch(key);

			if (ttl) {
				multi.set(key, JSON.stringify(value), 'EX', ttl);
			} else {
				multi.set(key, JSON.stringify(value));
			}

			await multi.exec();
			this.logger.debug(`Cache transaction set for key: ${key}`);
		} catch (error) {
			await multi.discard();
			this.logger.error(
				`Transaction error setting cache for key ${key}:`,
				error,
			);
			throw error;
		} finally {
			await this.redisClients.unwatch();
		}
	}

	async get(key: string): Promise<string | null> {
		try {
			const value = await this.redisClients.get(key);
			this.logger.debug(`Cache retrieved for key: ${key}`);
			return value;
		} catch (error) {
			this.logger.error(`Error getting cache for key ${key}:`, error);
			throw error;
		}
	}

	async del(key: string): Promise<void> {
		try {
			await this.redisClients.del(key);
			this.logger.debug(`Cache deleted for key: ${key}`);
		} catch (error) {
			this.logger.error(`Error deleting cache for key ${key}:`, error);
			throw error;
		}
	}
}

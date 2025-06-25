import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
	appConfig,
	authConfig,
	cacheConfig,
	databaseConfig,
	mailConfig,
	tonConfig,
} from '@configs/configuration.config';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerMiddleware } from '@modules/middleware';
import * as path from 'path';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SeedsModule } from './common/seeds/seeds.module';
import { HttpErrorFilter } from './interceptors/httpError.filter';
import {
	AcceptLanguageResolver,
	CookieResolver,
	HeaderResolver,
	I18nModule,
	QueryResolver,
} from 'nestjs-i18n';
import { FilesModule } from '@modules/files/files.module';
import { SharedModule } from '@modules/shared/shared.module';
import { CronModule } from '@modules/cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as cookieParser from 'cookie-parser';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './modules/queue/queue.module';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from '@modules/rooms/rooms.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheDomainModule } from '@modules/cache/cache-domain.module';
import { ClientNotificationGateway, GameGateway } from './gateways';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GamesModule } from './modules/games/games.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validationOptions: {
				abortEarly: false,
			},
			load: [
				databaseConfig,
				mailConfig,
				authConfig,
				appConfig,
				tonConfig,
				cacheConfig,
			],
			isGlobal: true,
			cache: true,
			expandVariables: true,
			envFilePath: '.env',
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				return {
					uri: configService.get<string>('DATABASE_URI'),
				};
			},
			inject: [ConfigService],
		}),
		UsersModule,
		AuthModule,
		RoomsModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', ''),
		}),
		SeedsModule,
		I18nModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				fallbackLanguage: configService.get('APP_LOCALE', 'en'),
				loaderOptions: {
					path: path.join(__dirname, '/i18n/'),
					watch: true,
				},
			}),
			resolvers: [
				{ use: AcceptLanguageResolver, options: ['en', 'vi'] },
				new QueryResolver(['lang', 'l']),
				new HeaderResolver(['x-lang', 'x-l']),
				new CookieResolver(['lang']),
			],
		}),
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				return {
					connection: {
						host: configService.get('REDIS_HOST'),
						port: configService.get('REDIS_PORT'),
						username: '',
						password: configService.get('REDIS_PASSWORD'),
						database: configService.get('REDIS_DB'),
					},
				};
			},
		}),
		FilesModule,
		SharedModule,
		CronModule,
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot([
			{
				ttl: 60 * 1000,
				limit: 400,
			},
		]),
		QueueModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
				},
			}),
		}),
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				const host = configService.get<string>('REDIS_HOST');
				const database = configService.get<number>('REDIS_DB');
				const password = configService.get<string>('REDIS_PASSWORD');
				const port = configService.get<number>('REDIS_PORT');

				return {
					store: await redisStore({
						database,
						username: '',
						password,
						socket: { host, port },
					}),
				};
			},
		}),
		CacheDomainModule,
		EventEmitterModule.forRoot({
			wildcard: true,
			delimiter: '.',
			maxListeners: 10,
		}),
		GamesModule,
	],
	controllers: [AppController],
	providers: [
		AppService,

		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: HttpErrorFilter,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},

		GameGateway,
		ClientNotificationGateway,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply(LoggerMiddleware, cookieParser())
			.forRoutes({ path: '*', method: RequestMethod.ALL });
	}
}

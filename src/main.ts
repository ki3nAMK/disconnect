import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { configSwagger } from '@configs/index';
import { CacheDomain } from '@modules/cache/cache-domain.service';
import { RedisIoAdapter } from './adapter';

async function bootstrap() {
	const logger = new Logger(bootstrap.name);
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.enableCors({
		origin: true,
	});
	app.use(express.json({ limit: '500mb' }));
	app.use(express.urlencoded({ limit: '500mb', extended: true }));
	app.use(cookieParser());

	app.setGlobalPrefix('api');

	configSwagger(app);
	const configService = app.get(ConfigService);

	const redisIoAdapter = new RedisIoAdapter(app, app.get(CacheDomain));
	await redisIoAdapter.connectToRedis();
	app.useWebSocketAdapter(redisIoAdapter);

	app.useStaticAssets(join(__dirname, './served'));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);
	await app.listen(configService.get('PORT'), () =>
		logger.log(
			`Link docs \x07${
				'http://localhost:' + configService.get('PORT')
			}/api-docs\x1b]8;;\x07`,
		),
	);
}

bootstrap();

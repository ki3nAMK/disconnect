import { FilterFileExcelUpload } from '../helpers/filter-file-upload.helper';
import * as process from 'node:process';

export interface DatabaseConfig {
	host: string;
	port: number;
	uri: string;
}

export const databaseConfig = () => ({
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT, 10),
		uri: process.env.DATABASE_URI,
	},
});

export const appConfig = () => ({
	APP_LOCALE: process.env.APP_LOCALE || 'en',
	MAIL_BACKUP_DB: process.env.MAIL_BACKUP_DB || 'thinhda@1bitlab.io',
	IS_BACKUP_DB: process.env.IS_BACKUP_DB || false,
	MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 20,
});

export const mailConfig = () => ({
	MAILER_INCOMING_USER:
		process.env.MAILER_INCOMING_USER || 'thinhda@1bitlab.io',
	MAILER_INCOMING_PASS: process.env.MAILER_INCOMING_PASS || 'weqpecyiidvgrtmx',
	MAILER_INCOMING_PORT: process.env.MAILER_INCOMING_PORT || '587',
	MAILER_INCOMING_HOST: process.env.MAILER_INCOMING_HOST || 'smtp.gmail.com',
	MAILER_FROM: process.env.MAILER_FROM || '',
});

export const cacheConfig = () => ({
	REDIS_PORT: process.env.REDIS_PORT || 6379,
	REDIS_HOST: process.env.REDIS_HOST || 'localhost',
	REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
	REDIS_DB: process.env.REDIS_DB || 0,
});

export const authConfig = () => ({
	SALT_ROUND: process.env.SALT_ROUND || 11,
	PASSWORD_SECRET_KEY: process.env.PASSWORD_SECRET_KEY || '',
	RESET_PASSWORD_URI_APP: process.env.RESET_PASSWORD_URI_APP || ``,
	RESET_PASSWORD_URI_WEB_ADMIN: process.env.RESET_PASSWORD_URI_WEB_ADMIN || ``,
	JWT_ACCESS_TOKEN_EXPIRATION_TIME:
		process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || 86400,
	JWT_REFRESH_TOKEN_EXPIRATION_TIME:
		process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || 604800,
	TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
});

export const tonConfig = () => ({
	TON_HUB_API: process.env.TON_HUB_API || 'https://testnet-v4.tonhubapi.com',
	TON_ALLOWED_DOMAINS: process.env.TON_ALLOWED_DOMAINS || '',
	TON_PROOF_PREFIX: process.env.TON_PROOF_PREFIX || 'ton-proof-item-v2/',
	TON_CONNECT_PREFIX: process.env.TON_CONNECT_PREFIX || 'ton-connect',
	TON_VALID_AUTH_TIME: process.env.TON_VALID_AUTH_TIME || 60,
});

export const multerConfig = {
	fileFilter: FilterFileExcelUpload,
};

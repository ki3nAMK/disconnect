import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				const user = configService.get('MAILER_INCOMING_USER');
				const pass = configService.get('MAILER_INCOMING_PASS');
				const port = Number(configService.get('MAILER_INCOMING_PORT'));
				const host = configService.get('MAILER_INCOMING_HOST');
				const MAILER_FROM = configService.get<string>('MAILER_FROM');

				return {
					transport: {
						host,
						port,
						ignoreTLS: false,
						secure: false,
						auth: {
							user,
							pass,
						},
					},
					defaults: {
						from: MAILER_FROM,
					},
					// preview: true,
					template: {
						dir: join(__dirname, 'templates'),
						adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
						options: {
							strict: true,
						},
					},
				};
			},
		}),
	],
	controllers: [],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '@modules/users/entities/user.entity';
import { SendMailDto } from '@modules/users/dto/send-mail.dto';
import { ERolesUser } from '@modules/users/enums/index.enum';

@Injectable()
export class MailService {
	private RESET_PASSWORD_URI_APP;
	private RESET_PASSWORD_URI_WEB_ADMIN;
	private MAIL_BACKUP_DB;
	private MAILER_FROM;

	constructor(
		private service: MailerService,
		private configService: ConfigService,
	) {
		this.RESET_PASSWORD_URI_APP = this.configService.get<string>(
			'RESET_PASSWORD_URI_APP',
		);
		this.RESET_PASSWORD_URI_WEB_ADMIN = this.configService.get<string>(
			'RESET_PASSWORD_URI_WEB_ADMIN',
		);
		this.MAIL_BACKUP_DB = this.configService.get<string>('MAIL_BACKUP_DB');
		this.MAILER_FROM = this.configService.get<string>('MAILER_FROM');
	}

	public MAILER_INCOMING_USER = this.configService.get(
		'MAILER_INCOMING_USER',
		'',
	);

	public async forgotPassword(user: User, code: number): Promise<any | null> {
		const { fullName, email, role } = user;
		const resetLink = this._getUriForgotPassword(user, code);
		const template = './forgot-password-app';

		await this.service
			.sendMail({
				to: email,
				// from: '"Support Team" <support@example.com>', // override default from
				from: `<${this.MAILER_FROM}>`,
				subject: 'Password Reset Verification Code',
				template, // `.hbs` extension is appended automatically
				context: {
					code,
					name: fullName,
				},
			})
			.then((res) => {
				console.log('res', res);
				return res;
			})
			.catch((err) => {
				console.log('err', err);
				return null;
			});
	}

	public async sendMailWithSubjectContent(
		dto: SendMailDto,
		user: User,
	): Promise<any | null> {
		const { subject, content } = dto;
		const { email } = user;

		await this.service
			.sendMail({
				to: email,
				from: `<${this.MAILER_FROM}>`,
				subject,
				template: './reply-with-content', // `.hbs` extension is appended automatically
				context: {
					content,
				},
			})
			.then((res) => {
				console.log('res', res);
				return res;
			})
			.catch((err) => {
				console.log('err', err);
				return null;
			});
	}

	_getUriForgotPassword({ email, role }: User, code: number) {
		switch (role) {
			case ERolesUser.ADMIN:
			case ERolesUser.STAFF:
				return `${this.RESET_PASSWORD_URI_WEB_ADMIN}?email=${email}&code=${code}`;
			case ERolesUser.USER:
				`${this.RESET_PASSWORD_URI_APP}?email=${email}&code=${code}`;
			default:
				return `${this.RESET_PASSWORD_URI_WEB_ADMIN}?email=${email}&code=${code}`;
		}
	}

	public async registerUser(user): Promise<any | null> {
		return this.service
			.sendMail({
				sender: this.MAILER_INCOMING_USER,
				to: user.email,
				from: this.MAILER_FROM,
				subject: 'Welcome to',
				html: `<p>Password: ${user.personalId}</p>
              <p></p>
              <p></p>`,
			})
			.then((res) => {
				// console.log('res', res);
				return res;
			})
			.catch((err) => {
				console.log('err', err);
				return null;
			});
	}

	public async sendEmailBackupDBWithAttachment(
		attachmentPath,
		filename,
	): Promise<any | null> {
		return this.service
			.sendMail({
				sender: this.MAILER_INCOMING_USER,
				to: this.MAIL_BACKUP_DB,
				from: this.MAILER_FROM,
				subject: 'MongoDB Backup',
				html: `Please find the Mongo backup attached.`,
				attachments: [
					{
						filename, // Customize the filename
						path: attachmentPath,
					},
				],
			})
			.then((res) => {
				console.log('res', res);
				return res;
			})
			.catch((err) => {
				console.log('err', err);
				return null;
			});
	}
}

import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { ConfigService } from '@nestjs/config';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as moment from 'moment';
import { MailService } from '@modules/mails/mail.service';
@Injectable()
export class BackupsService {
	private DATABASE_USERNAME;
	private DATABASE_PASSWORD;
	private DATABASE_PORT;
	private DATABASE_HOST;
	private DATABASE_NAME;

	constructor(
		private readonly configService: ConfigService,
		private readonly mailService: MailService,
	) {
		this.DATABASE_USERNAME = this.configService.get('DATABASE_USERNAME');
		this.DATABASE_PASSWORD = this.configService.get('DATABASE_PASSWORD');
		this.DATABASE_PORT = this.configService.get('DATABASE_PORT');
		this.DATABASE_HOST = this.configService.get('DATABASE_HOST');
		this.DATABASE_NAME = this.configService.get('DATABASE_NAME');
	}

	async create() {
		const backupFolder = '/assets/backup';

		try {
			this.createFolderIfNotExists(backupFolder);
			this.createFolderIfNotExists(`${backupFolder}/${this.DATABASE_NAME}`);

			// Run the mongodump command with authentication
			execSync(
				`mongodump --db=${this.DATABASE_NAME} --host=${this.DATABASE_HOST} --port=${this.DATABASE_PORT} --username=${this.DATABASE_USERNAME} --password="${this.DATABASE_PASSWORD}" --authenticationDatabase=${this.DATABASE_PASSWORD} --out=${backupFolder}`,
			);

			const filename = `backup_${this.DATABASE_NAME}_${moment().format(
				'DD_MM_YYYY',
			)}.zip`;

			const attachmentPath = `${backupFolder}/${filename}`;

			await this.createZip(
				`${backupFolder}/${this.DATABASE_NAME}`,
				attachmentPath,
			);

			this.mailService.sendEmailBackupDBWithAttachment(
				attachmentPath,
				filename,
			);

			return {
				data: attachmentPath,
			};
		} catch (error) {
			console.error(`Error during backup: ${error.message}`);
		}
	}

	async createZip(sourcePath: string, zipFilePath: string): Promise<void> {
		const output = fs.createWriteStream(zipFilePath);
		const archive = archiver('zip', { zlib: { level: 9 } });

		archive.pipe(output);
		archive.directory(sourcePath, false);
		await archive.finalize();
	}

	createFolderIfNotExists(folderPath: string): void {
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}
	}
}

import { BackupsService } from '@modules/backups/backups.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {
	private IS_BACKUP_DB;

	constructor(
		private readonly backupService: BackupsService,
		private readonly configService: ConfigService,
	) {
		this.IS_BACKUP_DB = this.configService.get<boolean>('IS_BACKUP_DB');
	}

	private timeouts = new Map<string, NodeJS.Timeout>();

	async scheduleTask(
		id: string,
		handleEvent: (taskId: string) => Promise<void>,
		delayMs = 60000,
	): Promise<void> {
		if (this.timeouts.has(id)) {
			console.log(`Task with id "${id}" already scheduled.`);
			return;
		}

		const timeout = setTimeout(async () => {
			try {
				await handleEvent(id);
			} catch (error) {
				console.error(`Error executing task "${id}":`, error);
			} finally {
				this.timeouts.delete(id);
			}
		}, delayMs);

		this.timeouts.set(id, timeout);
		console.log(`Scheduled task "${id}" in ${delayMs / 1000}s`);
	}

	async cancelTask(id: string, handleDone: () => Promise<void>): Promise<void> {
		const timeout = this.timeouts.get(id);
		if (timeout) {
			clearTimeout(timeout);
			this.timeouts.delete(id);

			await handleDone();
			console.log(`Canceled task "${id}"`);
		} else {
			console.log(`No task found with id "${id}"`);
		}
	}

	@Cron('0 0 0 * * *', {})
	async backUpDBEveryDay(): Promise<any> {
		if (this.IS_BACKUP_DB) this.backupService.create();
	}
}

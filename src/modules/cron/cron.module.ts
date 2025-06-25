import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { BackupsModule } from '@modules/backups/backups.module';

@Module({
	imports: [BackupsModule],
	providers: [CronService],
	exports: [CronService],
})
export class CronModule {}

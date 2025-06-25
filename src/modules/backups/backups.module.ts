import { Module } from '@nestjs/common';
import { BackupsService } from './backups.service';
import { BackupsController } from './backups.controller';
import { MailModule } from '@modules/mails/mail.module';

@Module({
	imports: [MailModule],
	controllers: [BackupsController],
	providers: [BackupsService],
	exports: [BackupsService],
})
export class BackupsModule {}

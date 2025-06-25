import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { ExecProcessor } from '@modules/queue/exec.processor';
import { MailModule } from '@modules/mails/mail.module';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'queue',
			prefix: 'queue',
		}),
		MailModule,
	],
	providers: [QueueService, ExecProcessor],
	exports: [QueueService],
})
export class QueueModule {}

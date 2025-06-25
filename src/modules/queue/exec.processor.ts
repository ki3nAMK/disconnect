import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PUBLISH_MAILS_CHANNEL } from '../../constants';
import { MailService } from '@modules/mails/mail.service';

@Processor('queue')
export class ExecProcessor extends WorkerHost {
	constructor(private readonly mailService: MailService) {
		super();
	}

	private logger = new Logger(ExecProcessor.name);

	@OnWorkerEvent('active')
	onQueueActive(job: Job) {
		this.logger.log(`ACTIVE: ${job.id}`);
	}

	@OnWorkerEvent('completed')
	onQueueComplete(job: Job, result: any) {
		this.logger.log(`COMPLETE: ${job.id}`);
	}

	@OnWorkerEvent('failed')
	onQueueFailed(job: Job, err: any) {
		this.logger.log(`FAILED: ${job.id}`);
		this.logger.log({ err });
	}

	@OnWorkerEvent('error')
	onQueueError(err: any) {
		this.logger.log(`ERROR: `);
		this.logger.log({ err });
	}

	async process(job: Job<any, any, string>, token?: string): Promise<any> {
		const { payload, execFunction } = job.data;

		switch (job.name) {
			case PUBLISH_MAILS_CHANNEL:
				return await this.mailService[execFunction](payload.dto, payload.user);

			default:
				throw new Error('No job name match');
		}
	}
}

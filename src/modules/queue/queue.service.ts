import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

@Injectable()
export class QueueService {
	constructor(
		@InjectQueue('queue')
		private readonly queue: Queue,
	) {}

	add(name: string, data: any): Promise<Job<any, any, string>> {
		return this.queue.add(name, data);
	}
}

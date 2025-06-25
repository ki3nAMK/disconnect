import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
	log(message: string, context?: string): void {
		super.log(message, context);
	}

	warn(message: string, context?: string): void {
		super.warn(message, context);
	}

	debug(message: string, context?: string): void {
		super.debug(message, context);
	}

	verbose(message: string, context?: string): void {
		super.verbose(message, context);
	}
}

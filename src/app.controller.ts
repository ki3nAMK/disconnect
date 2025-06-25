import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
@Controller()
export class AppController {
	@WebSocketServer()
	server: Server;

	constructor(private readonly appService: AppService) {}

	@Get()
	getHello() {
		return this.appService.getHello();
	}

	@Get('/build-info')
	getBuildInfo() {
		return 1;
	}
}

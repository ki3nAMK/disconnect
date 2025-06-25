import { OnEvent } from '@nestjs/event-emitter';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { includes } from 'lodash';
import { Server, Socket } from 'socket.io';
import { CustomSocket, SocketNamespace } from 'src/types/socket.type';

@WebSocketGateway({
	cors: {
		origin: '*',
		credentials: false,
	},
	pingInterval: 1000,
	pingTimeout: 3000,
	namespace: SocketNamespace.CLIENT_NOTIFICATION,
})
export class ClientNotificationGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	async handleConnection(client: CustomSocket) {
		const token = client.handshake.query.token;
		client.join(token);
	}

	async handleDisconnect(client: CustomSocket) {
		const token = client.handshake.query.token;
		client.leave(token as string);
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(
		@MessageBody() room: string,
		@ConnectedSocket() client: Socket,
	): void {
		client.join(room);
		client.emit('message', `Joined room: ${room}`);
	}

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: { room: string; message: string },
		@ConnectedSocket() client: Socket,
	): void {
		const { room, message } = data;
		this.server.to(room).emit('message', {
			message,
			user: client.data.user,
			room,
		});
	}

	@OnEvent('session.newDevice')
	handleNewDeviceLogin(payload: { token: string }) {
		const { token } = payload;

		const socketIds = (this.server.sockets as any)?.keys();

		for (const socketId of socketIds) {
			const socket = (this.server.sockets as any)?.get(
				socketId,
			) as CustomSocket;
			if (includes(token, socket.handshake.query.token)) {
				socket.emit('newSessionLogin', payload);

				socket.leave(token);

				socket.disconnect();
			}
		}
	}

	@SubscribeMessage('logout-notify')
	async handleLogoutNotify(
		@MessageBody() data: { logout: boolean },
		@ConnectedSocket() client: CustomSocket,
	): Promise<void> {
		console.log('LOGOUT NOTIFY');

		client.disconnect();
	}
}

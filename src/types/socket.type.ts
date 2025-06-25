import { Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket-types';

export enum SocketNamespace {
	IN_GAME = 'game',
	CLIENT_NOTIFICATION = 'CLIENT_NOTIFICATION',
	ADMIN_NOTIFICATION = 'ADMIN_NOTIFICATION',
}

export type CustomSocket = Socket & {
	handshake: Handshake & {
		token: string;
		currentUserId: string;
	};
};

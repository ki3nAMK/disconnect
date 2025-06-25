import { CronService } from '@modules/cron/cron.service';
import { Player, Room } from '@modules/rooms/entities';
import { EStatusPlayer } from '@modules/rooms/enums/index.enum';
import { RoomsService } from '@modules/rooms/rooms.service';
import { User } from '@modules/users/entities';
import { UsersService } from '@modules/users/users.service';
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
import { filter, find, includes, isNil, map } from 'lodash';
import { Server } from 'socket.io';
import { CustomSocket, SocketNamespace } from 'src/types/socket.type';
import { GameStateInterface } from '@modules/games/interfaces';

@WebSocketGateway({
	cors: {
		origin: '*',
		credentials: false,
	},
	pingInterval: 1000,
	pingTimeout: 3000,
	namespace: SocketNamespace.IN_GAME,
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private CHANNEL = 'general';

	constructor(
		private readonly cronService: CronService,
		private readonly roomService: RoomsService,
		private readonly usersService: UsersService,
	) {}

	@WebSocketServer() private readonly server: Server;

	async handleConnection(client: CustomSocket) {
		client.join(this.CHANNEL);
		console.log('connected with id: ', client.id);

		// * User join current room
		const userId = client.handshake.currentUserId;
		const room = await this.roomService.findRoomsByPlayerId(userId);
		if (!isNil(room)) {
			client.join(room._id.toString());

			console.log('User joined room: ', room);

			// ! Handle user reconnect
			await this.cronService.cancelTask(
				client.handshake.currentUserId,
				async () => {
					this.roomService.handleUpdateStatusPlayerInRoom(
						room._id.toString(),
						userId,
						EStatusPlayer.ONLINE,
					);
				},
			);

			this.handleEmitConnectionRoom({
				roomId: room._id.toString(),
				playerId: userId,
				status: EStatusPlayer.ONLINE,
			});
		}
	}

	async handleDisconnect(client: CustomSocket) {
		console.log('disconnect');
		client.leave(this.CHANNEL);

		// ! Handle event user disconnect
		await this.handleUserDisconnectFromRoom(client.handshake.currentUserId);
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(
		@MessageBody() room: string,
		@ConnectedSocket() client: CustomSocket,
	): void {
		client.join(room);
		client.emit('message', `Joined room: ${room}`);
	}

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: { room: string; message: string },
		@ConnectedSocket() client: CustomSocket,
	): void {
		const { room, message } = data;
		this.server.to(room).emit('message', {
			message,
			user: client.data.user,
			room,
		});
	}

	@SubscribeMessage('logout-room')
	async handleLogoutRoom(
		@MessageBody() data: { logout: boolean },
		@ConnectedSocket() client: CustomSocket,
	): Promise<void> {
		console.log('LOGOUT ROOM');

		const userId = client.handshake.currentUserId;
		const user = await this.usersService.findOne(userId);
		const room = await this.roomService.findRoomsByPlayerId(userId);
		await this.roomService.handleLeaveRoom(room._id.toString(), user);

		client.disconnect();
	}

	async handleUserDisconnectFromRoom(userId: string) {
		const user = await this.usersService.findOne(userId);
		const room = await this.roomService.findRoomsByPlayerId(userId);

		if (isNil(user) || isNil(room)) {
			console.error('User or room is not exist');
			return;
		}

		console.log('RECEIVE EVENT USER DISCONECT');

		const currentRoom = await this.roomService.findOne(room.id);
		const isUserInCurrentRoom = find(
			currentRoom.players,
			(player) => player.playerId.toString() === userId,
		);

		if (isNil(isUserInCurrentRoom)) {
			console.error('userNotFoundInRoom');
			return;
		}

		console.log('SUCCESS ON CRON LEAVE ROOM');

		const resp = await this.roomService.handleUpdateStatusPlayerInRoom(
			room._id.toString(),
			userId,
			EStatusPlayer.OFFLINE,
		);

		if (isNil(resp)) {
			console.error('Error update status player in room');
			return;
		}

		this.handleEmitConnectionRoom({
			roomId: room._id.toString(),
			playerId: user._id.toString(),
			status: EStatusPlayer.OFFLINE,
		});

		await this.cronService.scheduleTask(
			user._id.toString(),
			async () => {
				console.log('HANDLE CRON LEAVE ROOM: ', user._id.toString());
				await this.roomService.handleLeaveRoom(room._id.toString(), user);
			},
			57 * 1000,
		);
	}

	handleEmitConnectionRoom(payload: {
		roomId: string;
		playerId: string;
		status: EStatusPlayer;
	}) {
		const { roomId } = payload;
		this.server.to(roomId).emit('playerConnection', payload);
	}

	@OnEvent('room.created')
	handleCreateRoom(payload: { room: Room; creater: string }) {
		let thisUserSocket: CustomSocket;
		const { room, creater } = payload;
		const roomId = room._id.toString();

		const socketIds = (this.server.sockets as any)?.keys();
		for (const socketId of socketIds) {
			const socket = (this.server.sockets as any)?.get(
				socketId,
			) as CustomSocket;

			if (socket.handshake.currentUserId === creater) {
				thisUserSocket = socket;
				thisUserSocket.join(roomId);
			}
		}

		this.server.to(roomId).emit('createRoomSuccess', {
			message: 'CreateRoomSuccess',
		});
	}

	@OnEvent('room.joined')
	handleJoinedRoom(payload: { roomId: string; player: Player }) {
		const { roomId, player } = payload;
		console.log('NEW PLAYER JOINED ROOM: ', roomId);
		const userId = player.playerId.toString();
		const socketIds = (this.server.sockets as any)?.keys();
		for (const socketId of socketIds) {
			const socket = (this.server.sockets as any)?.get(
				socketId,
			) as CustomSocket;

			if (includes([userId], socket.handshake.currentUserId)) {
				socket.join(roomId);
			}
		}

		this.server.to(roomId).emit('newPlayerJoined', payload);
	}

	@OnEvent('room.leaved')
	handleLeaveRoom(payload: { roomId: string; player: User }) {
		const { roomId, player } = payload;
		console.log('NEW PLAYER LEAVED ROOM: ', roomId);
		const userId = player._id.toString();
		const socketIds = (this.server.sockets as any)?.keys();
		for (const socketId of socketIds) {
			const socket = (this.server.sockets as any)?.get(
				socketId,
			) as CustomSocket;

			if (includes([userId], socket.handshake.currentUserId)) {
				socket.leave(roomId);
			}
		}

		this.server.to(roomId).emit('newPlayerLeaved', {
			...payload,
			player: {
				...player,
				id: player._id.toString(),
			},
		});
	}

	@OnEvent('room.start')
	handleStartRoom(payload: { room: Room }) {
		const { room } = payload;
		const roomId = room._id.toString();

		this.server.to(roomId).emit('roomStart', payload);
	}

	@OnEvent('room.cancle')
	handleCreaterLeaveRoom(payload: { room: Room }) {
		const { room } = payload;

		const playerInRoom = map(
			filter(room.players, (player) => player.playerId !== room.ownerId),
			(player) => player.playerId.toString(),
		);

		const socketIds = (this.server.sockets as any)?.keys();
		const roomId = room._id.toString();

		console.log('CREATER LEAVED ROOM: ', roomId);

		for (const socketId of socketIds) {
			const socket = (this.server.sockets as any)?.get(
				socketId,
			) as CustomSocket;
			if (includes(playerInRoom, socket.handshake.currentUserId)) {
				socket.emit('createrLeave', { roomId });

				socket.leave(roomId);
			}

			if (includes([room.ownerId.toString()], socket.handshake.currentUserId)) {
				socket.leave(roomId);
			}
		}
	}

	@OnEvent('room.game.startTurn')
	handleEmitStartTurn(payload: {
		roomId: string;
		playerId: string;
		game: GameStateInterface;
	}) {
		console.log('RECEIVE EVENT StartTurn: ', payload.playerId);
		const { roomId } = payload;
		this.server.to(roomId).emit('startTurn', payload);
	}

	@OnEvent('room.game.rollDiceStart')
	handleEmitRollDiceStart(payload: {
		roomId: string;
		playerId: string;
		game: GameStateInterface;
	}) {
		const { roomId } = payload;
		this.server.to(roomId).emit('rollDiceStart', payload);
	}

	@OnEvent('room.game.rollDiceEnd')
	handleEmitRollDiceEnd(payload: {
		roomId: string;
		playerId: string;
		game: GameStateInterface;
	}) {
		const { roomId } = payload;
		// Emit roll dice end event
		this.server.to(roomId).emit('rollDiceEnd', payload);
	}

	@OnEvent('room.game.rolledDoublesThreeTimes')
	handleEmitRolledDoublesThreeTimes(payload: {
		roomId: string;
		playerId: string;
		game: GameStateInterface;
	}) {
		const playerSocketId = this.server.sockets.sockets.get(
			payload.playerId,
		)?.id;

		if (playerSocketId) {
			this.server.to(playerSocketId).emit('rolledDoublesThreeTimes', payload);
		}
	}
}

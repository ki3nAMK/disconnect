import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { RoomsRepositoryInterface } from './interfaces';
import { ConfigService } from '@nestjs/config';
import { ExcelService } from '@modules/excel/excel.service';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Types, UpdateQuery } from 'mongoose';
import { QueueService } from '@modules/queue/queue.service';
import { Player, Room } from './entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { filter, find, isNil, map, size } from 'lodash';
import { User } from '@modules/users/entities';
import { EStatusPlayer, EStatusRoom } from './enums/index.enum';
import { PreStartPlayerDto, StartRoomDto } from './dto/start-room.dto';
import { getRandomOrder } from 'src/helpers/room.helper';
import { GamesService } from '@modules/games/games.service';
import { GameStateInterface } from '@modules/games/interfaces';
import { NotFoundError } from 'rxjs';
import { RollDiceDto } from '@modules/rooms/dto/roll-dice.dto';
import { AppResponse } from '../../types/common.type'

@Injectable()
export class RoomsService extends BaseServiceAbstract<Room> {
	private SALT_ROUND;

	constructor(
		@Inject('RoomsRepositoryInterface')
		private readonly roomsRepository: RoomsRepositoryInterface,
		private readonly configService: ConfigService,
		private readonly excelService: ExcelService,
		@InjectConnection() private readonly connection: mongoose.Connection,
		private readonly queuService: QueueService,
		private eventEmitter: EventEmitter2,
		private readonly gamesService: GamesService,
	) {
		super(roomsRepository);
		this.SALT_ROUND = this.configService.get<number>('SALT_ROUND');
	}

	async handleCreate(item: any, user: User): Promise<Room> {
		console.log('items: ', item);

		const room = await this.roomsRepository.create({
			...item,
		});

		this.eventEmitter.emit('room.created', {
			room,
			creater: user._id.toString(),
		});

		return room;
	}

	async update(id: string, updatedData: UpdateQuery<Room>): Promise<Room> {
		const room = await this.roomsRepository.findOneById(id);

		if (!room || room.deletedAt) {
			throw new Error('Room not found or has been deleted');
		}

		return await this.roomsRepository.update(id, updatedData);
	}

	async handleGetRoomAndJoin(id: string, user: User): Promise<Room> {
		const room = await this.findOne(id);

		if (isNil(room)) {
			throw new Error('Room is not exist');
		}

		const isPlayerInRoom = find(
			room.players,
			(player) => player.playerId.toString() === user._id.toString(),
		);

		if (size(room.players) === 4 && isNil(isPlayerInRoom)) {
			throw new Error('Room is full (4 players)');
		}

		if (room.players.length !== 4 && isNil(isPlayerInRoom)) {
			const newPlayer: Player = {
				playerId: user._id as any,
				playerName: user.fullName,
				seatNumber: 1,
				playingOrder: 0,
				status: EStatusPlayer.ONLINE,
			};

			const updatedRoom = await this.update(id, {
				$push: {
					players: newPlayer,
				},
			});

			this.eventEmitter.emit('room.joined', {
				roomId: room._id.toString(),
				player: newPlayer,
			});

			return updatedRoom;
		}

		return room;
	}

	async findOneGame(
		roomId: string,
		user: User,
	): Promise<{ data: { room: Room; game: GameStateInterface } }> {
		const room = await this.findOne(roomId);

		if (!room || room.deletedAt) {
			throw new NotFoundException('rooms.Room not found or has been deleted');
		}

		const isPlayerInRoom = find(
			room.players,
			(player) => player.playerId.toString() === user._id.toString(),
		);

		if (isNil(isPlayerInRoom)) {
			throw new NotFoundException('rooms.Player not found in room');
		}

		if (room.status !== EStatusRoom.START) {
			throw new BadRequestException('rooms.Room not started yet');
		}

		const game = await this.gamesService.getGame(roomId);

		return {
			data: {
				room,
				game,
			},
		};
	}

	async handleLeaveRoom(id: string, user: User) {
		const room = await this.findOne(id);

		if (isNil(room)) {
			console.error('Room not found');
			return null;
		}

		const isPlayerCreater = room.ownerId.toString() === user._id.toString();

		try {
			if (isPlayerCreater) {
				await this.remove(id);

				this.eventEmitter.emit('room.cancle', { room, user });

				return { success: true };
			}

			await this.update(id, {
				players: filter(
					room.players,
					(player) => player.playerId.toString() !== user._id.toString(),
				),
			});

			console.log('LEAVE ROOM: ', user);

			this.eventEmitter.emit('room.leaved', {
				roomId: room._id.toString(),
				player: user,
			});

			return { success: true };
		} catch (err) {
			console.log('ERROR LEAVE ROOM: ', err);
			return { success: false };
		}
	}

	async findRoomsByPlayerId(userId: string): Promise<Room | null> {
		const room = await this.findOneByCondition({
			'players.playerId': new Types.ObjectId(userId),
		});

		if (isNil(room)) {
			console.error('Room not found');
			return null;
		}

		return room;
	}

	async handleUpdateStatusPlayerInRoom(
		roomId: string,
		userId: string,
		status: EStatusPlayer,
	): Promise<Room | null> {
		const room = await this.findOne(roomId);

		if (isNil(room)) {
			console.error('Room not found');
			return null;
		}

		const player = room.players.find((p) => p.playerId.toString() === userId);
		if (!player) {
			console.error('Player not found in room');
			return null;
		}

		player.status = status;
		await this.update(roomId, { players: room.players });

		return room;
	}

	async handleStartRoom(
		roomId: string,
		user: User,
		startRoomDto: StartRoomDto,
	) {
		const room = await this.findOne(roomId);

		if (isNil(room)) {
			throw new Error('Room is not exist');
		}

		if (size(room.players) !== 4) {
			throw new Error('Room is not full');
		}

		if (room.ownerId.toString() !== user._id.toString()) {
			throw new Error('Only creater can start room');
		}

		if (room.status === 'Start') {
			throw new Error('Room already started!');
		}

		const playerIdList = map(room.players, (player) =>
			player.playerId.toString(),
		);

		const playerIdDto = [
			...map(startRoomDto.players, (player) => player.playerId),
		];

		const hasCommon = playerIdList.some((id) => playerIdDto.includes(id));

		if (!hasCommon) {
			throw Error('Player is not belong to this room');
		}

		const randomOrder: number[] = getRandomOrder();

		for (let i = 0; i < randomOrder.length; i++) {
			const seatValue: PreStartPlayerDto = find(
				startRoomDto.players,
				(player) => player.playerId === room.players[i].playerId.toString(),
			);

			room.players[i] = {
				...room.players[i],
				seatNumber: seatValue.seatNumber,
				playingOrder: randomOrder[i],
			};
		}

		await this.roomsRepository.update(roomId, {
			players: room.players,
			status: 'Start',
		});

		const game = await this.gamesService.createGame(roomId, room.players);

		this.eventEmitter.emit('room.start', {
			room,
			game,
		});

		return { success: true, data: game };
	}

	async rollDice(
		roomId: string,
		user: User,
		dto: RollDiceDto,
	): Promise<AppResponse<{ room: Room; game: GameStateInterface }>> {
		const room = await this.findOne(roomId);

		if (!room || room.deletedAt) {
			throw new NotFoundException('rooms.Room not found or has been deleted');
		}

		const isPlayerInRoom = find(
			room.players,
			(player) => player.playerId.toString() === user._id.toString(),
		);

		if (isNil(isPlayerInRoom)) {
			throw new NotFoundException('rooms.Player not found in room');
		}

		if (room.status !== EStatusRoom.START) {
			throw new BadRequestException('rooms.Room not started yet');
		}

		const game = await this.gamesService.rollDice(roomId, user, dto);

		return { data: { game, room } };
	}
}

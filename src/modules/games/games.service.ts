import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { PlayerService } from '@modules/games/player.service';
import { TilesService } from '@modules/games/tiles.service';
import { Player } from '@modules/rooms/entities';
import { GameStateInterface } from '@modules/games/interfaces';
import { GameStateService } from '@modules/games/games-state.service';
import {
	ETileTypeGame,
	ETurnStatusGame,
} from '@modules/games/enums/index.enum';
import { randomInt } from 'crypto';
import { User } from '@modules/users/entities';
import { RollDiceDto } from '@modules/rooms/dto/roll-dice.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CronService } from '@modules/cron/cron.service';

@Injectable()
export class GamesService {
	private readonly logger = new Logger(GamesService.name);

	constructor(
		private readonly playerService: PlayerService,
		private readonly tilesService: TilesService,
		private readonly gameStateService: GameStateService,
		private eventEmitter: EventEmitter2,
		private readonly cronService: CronService,
	) {}

	async createGame(
		roomId: string,
		players: Player[],
	): Promise<GameStateInterface> {
		// Initialize players with starting positions and balances
		const initializedPlayers = this.playerService.initializePlayers(players);

		// Create initial game state
		const gameState: GameStateInterface = {
			roomId,
			board: this.tilesService.getBoardTiles(),
			players: initializedPlayers,
			currentTurnIndex: 0,
			lastDice: [0, 0],
			turnStartAt: Date.now(),
			startedAt: Date.now(),
			logs: ['Game started'],
			activePlayerIds: initializedPlayers.map((player) => player.playerId),
			roundCount: 0,
			maxRounds: 30,
			turnStatus: ETurnStatusGame.WAITING_FOR_ROLL,
		};

		await this.gameStateService.saveGame(roomId, gameState);

		await this.startTurn(roomId, initializedPlayers[0].playerId);

		return gameState;
	}

	async getGame(roomId: string): Promise<GameStateInterface> {
		const gameState = await this.gameStateService.getGame(roomId);

		if (!gameState) {
			throw new NotFoundException('games.Game not found');
		}

		return gameState;
	}

	async startTurn(roomId: string, playerId: string): Promise<void> {
		const game = await this.gameStateService.getGame(roomId);
		const player = game.players.find((p) => p.playerId === playerId);

		if (!player) throw new NotFoundException('games.Player not found');

		const turnId = `WAITING_FOR_ROLL_${playerId}`;

		await this.cronService.scheduleTask(
			turnId,
			async () => {
				this.logger.log(`Dice roll timeout for player: ${playerId}`);
				await this._movePlayer(roomId, playerId);
			},
			15 * 1000, // 15 seconds timeout
		);

		game.turnId = turnId;
		game.turnStatus = ETurnStatusGame.WAITING_FOR_ROLL;

		this.eventEmitter.emit('room.game.startTurn', {
			roomId,
			playerId,
			game,
		});

		await this.gameStateService.saveGame(roomId, game);
	}

	async rollDice(
		roomId: string,
		user: User,
		dto: RollDiceDto,
	): Promise<GameStateInterface> {
		const game = await this.gameStateService.getGame(roomId);
		const playerId = user._id.toString();

		const player = game.players.find((p) => p.playerId === playerId);

		if (
			!player ||
			game.currentTurnIndex !== game.players.indexOf(player) ||
			game.turnStatus !== ETurnStatusGame.WAITING_FOR_ROLL
		) {
			throw new BadRequestException('games.Not your turn');
		}

		this.eventEmitter.emit('room.game.rollDiceStart', {
			roomId,
			playerId,
			game,
		});

		const newGame = await this._movePlayer(roomId, playerId, dto);

		this.eventEmitter.emit('room.game.rollDiceEnd', {
			roomId,
			playerId,
			game: newGame,
		});

		return newGame;
	}

	_rollDice(dto?: RollDiceDto): { dice: [number, number]; total: number } {
		if (dto && dto?.dice1 && dto?.dice2) {
			return { dice: [dto?.dice1, dto?.dice2], total: dto?.dice1 + dto?.dice2 };
		}

		const dice1 = randomInt(1, 7);
		const dice2 = randomInt(1, 7);
		const total = dice1 + dice2;
		return { dice: [dice1, dice2], total };
	}

	private async _movePlayer(
		roomId: string,
		playerId: string,
		dto?: RollDiceDto,
	): Promise<GameStateInterface> {
		const game = await this.gameStateService.getGame(roomId);
		const player = game.players.find((p) => p.playerId === playerId);
		const playerIndex = game.players.findIndex((p) => p.playerId === playerId);
		const { dice, total } = this._rollDice(dto);

		// Move player
		const previousPosition = player.position;
		player.position = (player.position + total) % 32;
		const tile = game.board[player.position];
		let log = `${player.playerName} rolled ${dice} and landed on ${tile.tileName}`;

		if (game.turnId) {
			await this.cronService.cancelTask(game.turnId, async () => {
				this.logger.debug(`Cancelled turn timeout for player: ${playerId}`);
			});
		}

		game.lastDice = dice;

		// Check for double rolls
		const isDouble = dice[0] === dice[1];

		if (isDouble) {
			player.doubleRollCount = (player.doubleRollCount || 0) + 1;

			if (player.doubleRollCount === 3) {
				// Send player to deserted island
				player.position = game.board.findIndex(
					(tile) => tile.tileType === ETileTypeGame.DESERTED_ISLAND,
				);

				player.inJail = true;
				player.jailTurns = 2;
				log += ` | ${player.playerName} rolled doubles three times consecutively and is sent to the deserted island!`;
				player.doubleRollCount = 0; // Reset double roll count
				game.turnStatus = ETurnStatusGame.WAITING_FOR_ACTION;
				game.players[playerIndex] = player;

				// Increment roundCount if the last player finishes their turn
				if (game.currentTurnIndex === game.players.length - 1) {
					game.roundCount += 1;
					log += ` | Round ${game.roundCount} completed.`;
				}
				game.logs.push(log);

				await this.gameStateService.saveGame(roomId, game);

				this.eventEmitter.emit('room.game.rolledDoublesThreeTimes', {
					roomId,
					playerId,
					game,
				});

				await this.handleActionTimeout(roomId, playerId, false);

				return game;
			}

			log += ` | ${player.playerName} rolled doubles and gets an extra turn!`;
		} else {
			player.doubleRollCount = 0; // Reset double roll count if not a double

			// Increment roundCount if the last player finishes their turn
			if (game.currentTurnIndex === game.players.length - 1) {
				game.roundCount += 1;
				log += ` | Round ${game.roundCount} completed.`;
			}
		}

		// Check if passing Start tile
		if (player.position < previousPosition && !player.inJail) {
			const salary = player.roundCount === 0 ? 600000 : 300000; // Double salary for first round
			player.balance += salary;
			log += ` | ${player.playerName} passed Start and received ${salary} GTN!`;
			player.roundCount += 1; // Increment round count
		}

		switch (tile.tileType) {
			case ETileTypeGame.DESERTED_ISLAND:
				player.inJail = true;
				player.jailTurns = 2;
				log += ' and is sent to the deserted island!';
				break;

			case ETileTypeGame.WORLD_TOUR:
				player.worldTourActive = true;
				log += ' and can choose a destination!';
				break;

			case ETileTypeGame.CITY:
			case ETileTypeGame.CARNIVAL_CITY:
				if (!tile.ownerId) {
					log += ` - can buy ${tile.tileName} for land: $${
						tile.pricing.land ?? 'N/A'
					}, apartment: $${tile.pricing.apartment ?? 'N/A'}, building: $${
						tile.pricing.building ?? 'N/A'
					}, hotel: $${tile.pricing.hotel ?? 'N/A'}, landmark: $${
						tile.pricing.landmark ?? 'N/A'
					}`;
				}
				break;

			case ETileTypeGame.START:
				// Allow player to choose a city to build upon
				const ownedCities = game.board.filter(
					(t) => t.tileType === ETileTypeGame.CITY && t.ownerId === playerId,
				);
				if (ownedCities.length > 0) {
					log += ` | Player can choose a city to build upon: ${ownedCities
						.map((c) => c.tileName)
						.join(', ')}`;
				}
				break;
		}

		game.logs.push(log);
		game.turnStatus = ETurnStatusGame.WAITING_FOR_ACTION;
		game.players[playerIndex] = player;

		await this.gameStateService.saveGame(roomId, game);
		await this.handleActionTimeout(roomId, playerId, isDouble);

		return game;
	}

	async handleActionTimeout(
		roomId: string,
		playerId: string,
		isDouble?: boolean,
	): Promise<void> {
		const game = await this.gameStateService.getGame(roomId);

		await this.cronService.scheduleTask(
			`WAITING_FOR_ACTION_${playerId}`,
			async () => {
				game.turnStatus = ETurnStatusGame.WAITING_FOR_ROLL;

				let nextPlayerId = playerId;

				if (!isDouble) {
					// Start the next player's turn
					const nextPlayerIndex =
						(game.currentTurnIndex + 1) % game.players.length;
					nextPlayerId = game.players[nextPlayerIndex].playerId;
					game.currentTurnIndex = nextPlayerIndex;
				}

				await this.gameStateService.saveGame(roomId, game);
				await this.startTurn(roomId, nextPlayerId);
			},
			30 * 1000, // 30 seconds timeout
		);
	}
}

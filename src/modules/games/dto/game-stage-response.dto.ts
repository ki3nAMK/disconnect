import { ApiProperty } from '@nestjs/swagger';
import { BoardTileInterface } from '@modules/games/interfaces/board-tile.interface';
import { PlayerStateInterface } from '@modules/games/interfaces/player-state.interface';
import { ETurnStatusGame } from '@modules/games/enums/index.enum';

class PlayerStateDto {
	@ApiProperty({ example: '6842ae9449e62d8b0415902a' })
	playerId: string;

	@ApiProperty({ example: '1' })
	playerName: string;

	@ApiProperty({ example: 1 })
	seatNumber: number;

	@ApiProperty({ example: 3 })
	playingOrder: number;

	@ApiProperty({ example: 'Online' })
	status: string;

	@ApiProperty({ example: '68527d77340fc57b7ab5f996' })
	_id: string;

	@ApiProperty({ example: 0 })
	position: number;

	@ApiProperty({ example: 2000000 })
	balance: number;

	@ApiProperty({ type: [String], example: [] })
	properties: string[];

	@ApiProperty({ example: false })
	inJail: boolean;

	@ApiProperty({ example: 0 })
	jailTurns: number;

	@ApiProperty({ example: false })
	worldTourActive: boolean;

	@ApiProperty({ example: false })
	bankrupt: boolean;
}

export class GameStateResponseDto {
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	roomId: string;

	@ApiProperty({
		isArray: true,
		example: {
			id: 0,
			tileName: 'Start',
			vnType: 'Ô đặc biệt',
			jpType: '特殊マス',
			tileType: 'START',
		},
	})
	board: BoardTileInterface[];

	@ApiProperty({
		isArray: true,
		example: [
			{
				playerId: '6842ae9449e62d8b0415902a',
				playerName: '1',
				seatNumber: 1,
				playingOrder: 3,
				status: 'Online',
				_id: '68527d77340fc57b7ab5f996',
				position: 0,
				balance: 2000000,
				properties: [],
				inJail: false,
				jailTurns: 0,
				worldTourActive: false,
				bankrupt: false,
			},
		],
	})
	players: PlayerStateInterface[];

	@ApiProperty({ example: 0, description: 'Index of current player' })
	currentTurnIndex: number;

	@ApiProperty({ example: [1, 6], description: 'Last dice roll result' })
	lastDice: [number, number];

	@ApiProperty({
		enum: ETurnStatusGame,
		example: ETurnStatusGame.WAITING_FOR_ROLL,
	})
	turnStatus: ETurnStatusGame;

	@ApiProperty({ example: 1709544000000 })
	turnStartAt: number;

	@ApiProperty({ example: 1709544000000 })
	startedAt: number;

	@ApiProperty({ required: false, example: 1709544000000 })
	endedAt?: number;

	@ApiProperty({ required: false, example: '507f1f77bcf86cd799439011' })
	winnerId?: string;

	@ApiProperty({ type: [String] })
	logs: string[];

	@ApiProperty({ type: [String] })
	activePlayerIds: string[];

	@ApiProperty({ example: 1 })
	roundCount: number;

	@ApiProperty({ required: false, example: 30 })
	maxRounds?: number;
}

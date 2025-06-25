import { BoardTileInterface } from '@modules/games/interfaces/board-tile.interface';
import { PlayerStateInterface } from '@modules/games/interfaces/player-state.interface';
import { ETurnStatusGame } from '@modules/games/enums/index.enum';

export interface GameStateInterface {
	roomId: string;
	board: BoardTileInterface[];

	players: PlayerStateInterface[];
	currentTurnIndex: number;
	lastDice: [number, number];
	turnStatus: ETurnStatusGame;

	turnStartAt: number;
	startedAt: number;
	endedAt?: number;

	winnerId?: string;
	logs: string[];

	activePlayerIds: string[];
	roundCount: number;
	maxRounds?: number;
	turnId?: string;
	actionTurnId?: string;
}

import { Injectable } from '@nestjs/common';
import { PlayerStateInterface } from '@modules/games/interfaces/player-state.interface';
import { Player } from '@modules/rooms/entities';

@Injectable()
export class PlayerService {
	private readonly INITIAL_BALANCE = 2000000;

	initializePlayers(players: Player[]): PlayerStateInterface[] {
		return players.map((player) => ({
			...player,
			playerId: player.playerId.toString(),
			position: 0,
			balance: this.INITIAL_BALANCE,
			properties: [],
			inJail: false,
			jailTurns: 0,
			worldTourActive: false,
			bankrupt: false,
			roundCount: 0,
			doubleRollCount: 0,
		}));
	}
}

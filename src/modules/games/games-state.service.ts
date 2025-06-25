import { Injectable } from '@nestjs/common';
import { GameStateInterface } from '@modules/games/interfaces';
import { CacheDomain } from '@modules/cache/cache-domain.service';

@Injectable()
export class GameStateService {
	constructor(private readonly cacheDomain: CacheDomain) {}

	async saveGame(roomId: string, state: GameStateInterface): Promise<void> {
		await this.cacheDomain.setTnx(`game:${roomId}`, state);
	}

	async getGame(roomId: string): Promise<GameStateInterface> {
		const raw = await this.cacheDomain.get(`game:${roomId}`);
		if (!raw) return null;
		return JSON.parse(raw);
	}

	async clearGame(roomId: string): Promise<void> {
		await this.cacheDomain.del(`game:${roomId}`);
	}
}

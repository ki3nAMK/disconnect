import { ETileTypeGame } from '@modules/games/enums/index.enum';

export interface BoardTileInterface {
	id: number;
	tileName: string;
	jpType: string;
	tileType: ETileTypeGame;
	pricing?: {
		land?: number;
		apartment?: number;
		building?: number;
		hotel?: number;
		landmark?: number;
	};
	passingFee?: {
		land?: number;
		apartment?: number;
		building?: number;
		hotel?: number;
		landmark?: number;
	};
	ownerId?: string;
}

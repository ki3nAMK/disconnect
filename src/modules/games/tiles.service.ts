import { Injectable } from '@nestjs/common';
import { BoardTileInterface } from '@modules/games/interfaces';
import { ETileTypeGame } from '@modules/games/enums/index.enum';
import { boardTiles } from '../../constants/tiles.constant';

@Injectable()
export class TilesService {
	private readonly boardTiles: BoardTileInterface[] = boardTiles;

	private selectRandomFestivalTiles(count: number): void {
		const eligibleTileTypes = [
			ETileTypeGame.CITY,
			// ETileTypeGame.TOURIST_BLUE,
			// ETileTypeGame.TOURIST_PINK,
		];

		// Get all city tiles that are not already festival cities
		const cityTiles = this.boardTiles.filter((tile) =>
			eligibleTileTypes.includes(tile.tileType),
		);

		// Randomly select cities
		for (let i = 0; i < Math.min(count, cityTiles.length); i++) {
			const randomIndex = Math.floor(Math.random() * cityTiles.length);
			const selectedCity = cityTiles[randomIndex];

			// Update the tile type in boardTiles
			const tileIndex = this.boardTiles.findIndex(
				(tile) => tile.id === selectedCity.id,
			);
			this.boardTiles[tileIndex] = {
				...this.boardTiles[tileIndex],
				tileType: ETileTypeGame.CARNIVAL_CITY,
				passingFee: Object.fromEntries(
					Object.entries(this.boardTiles[tileIndex].passingFee || {}).map(
						([key, value]) => [key, value ? value * 2 : value],
					),
				),
			};

			// Remove selected city from array to avoid duplicates
			cityTiles.splice(randomIndex, 1);
		}
	}

	getBoardTiles(): BoardTileInterface[] {
		this.selectRandomFestivalTiles(3); // Select 3 random festival tiles
		return this.boardTiles;
	}

	getTileById(id: number): BoardTileInterface | undefined {
		return this.boardTiles.find((tile) => tile.id === id);
	}

	getTilesByType(tileType: ETileTypeGame): BoardTileInterface[] {
		return this.boardTiles.filter((tile) => tile.tileType === tileType);
	}
}

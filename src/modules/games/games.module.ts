import { forwardRef, Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TilesService } from '@modules/games/tiles.service';
import { PlayerService } from '@modules/games/player.service';
import { CacheDomain } from '@modules/cache/cache-domain.service';
import { GameStateService } from '@modules/games/games-state.service';
import { CronModule } from '@modules/cron/cron.module';

@Module({
	imports: [forwardRef(() => CronModule)],
	controllers: [GamesController],
	providers: [
		GamesService,
		TilesService,
		PlayerService,
		CacheDomain,
		GameStateService,
	],
	exports: [GamesService],
})
export class GamesModule {}

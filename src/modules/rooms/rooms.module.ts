import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchemaFactory } from './entities';
import { SharedModule } from '@modules/shared/shared.module';
import { ExcelModule } from '@modules/excel/excel.module';
import { forwardRef, Module } from '@nestjs/common';
import { QueueModule } from '@modules/queue/queue.module';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from '@repositories/rooms.repository';
import { GamesModule } from '@modules/games/games.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Room.name,
				useFactory: RoomSchemaFactory,
			},
		]),
		SharedModule,
		ExcelModule,
		forwardRef(() => QueueModule),
		GamesModule,
	],
	controllers: [RoomsController],
	providers: [
		RoomsService,
		{ provide: 'RoomsRepositoryInterface', useClass: RoomsRepository },
	],
	exports: [RoomsService],
})
export class RoomsModule {}

import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Files, FilesSchema } from '@modules/files/entities/file.entity';
import { FilesRepository } from '@repositories/files.repository';
import { SharedModule } from '@modules/shared/shared.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Files.name, schema: FilesSchema }]),
		SharedModule,
	],
	controllers: [FilesController],
	providers: [
		FilesService,
		{
			provide: 'FilesRepositoryInterface',
			useClass: FilesRepository,
		},
	],
})
export class FilesModule {}

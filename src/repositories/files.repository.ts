import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import { Files, FilesDocument } from '@modules/files/entities/file.entity';
import { FilesRepositoryInterface } from '@modules/files/interfaces/files.interface';

@Injectable()
export class FilesRepository
	extends BaseRepositoryAbstract<FilesDocument>
	implements FilesRepositoryInterface
{
	constructor(
		@InjectModel(Files.name)
		private readonly filesModel: Model<FilesDocument>,
		@InjectConnection() connection: Connection,
	) {
		super(filesModel, connection);
	}
}

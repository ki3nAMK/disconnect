import { Room, RoomDocument } from '@modules/rooms/entities';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import { RoomsRepositoryInterface } from '@modules/rooms/interfaces';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { FindAllResponse } from 'src/types/common.type';

@Injectable()
export class RoomsRepository
	extends BaseRepositoryAbstract<RoomDocument>
	implements RoomsRepositoryInterface
{
	constructor(
		@InjectModel(Room.name)
		private readonly room_model: Model<RoomDocument>,
		@InjectConnection() connection: Connection,
	) {
		super(room_model, connection);
	}

	async findAllWithSubFields(
		condition: object,
		options: {
			projection?: string;
			populate?: string[] | any;
			offset?: number;
			limit?: number;
		},
	): Promise<FindAllResponse<RoomDocument>> {
		const [count, items] = await Promise.all([
			this.room_model.count({ ...condition, deletedAt: null }),
			this.room_model
				.find({ ...condition, deletedAt: null }, options?.projection || '', {
					skip: options.offset || 0,
					limit: options.limit || 10,
				})
				.populate(options.populate),
		]);
		return {
			count,
			items,
		};
	}
}

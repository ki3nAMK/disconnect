import { Room } from '../entities';
import { BaseRepositoryInterface } from '@repositories/index';
import { FindAllResponse } from 'src/types/common.type';

export interface RoomsRepositoryInterface
	extends BaseRepositoryInterface<Room> {
	findAllWithSubFields(
		condition: object,
		options: {
			projection?: string;
			populate?: string[] | any;
			offset?: number;
			limit?: number;
		},
	): Promise<FindAllResponse<Room>>;
}

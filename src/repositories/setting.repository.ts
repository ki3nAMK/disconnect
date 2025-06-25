import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import {
	Setting,
	SettingDocument,
} from '@modules/settings/entities/setting.entity';
import { SettingRepositoryInterface } from '@modules/settings/interfaces/setting.interface';
import { FindAllResponse } from '../types/common.type';

@Injectable()
export class SettingRepository
	extends BaseRepositoryAbstract<SettingDocument>
	implements SettingRepositoryInterface
{
	constructor(
		@InjectModel(Setting.name)
		private readonly settingModel: Model<SettingDocument>,
		@InjectConnection() connection: Connection,
	) {
		super(settingModel, connection);
	}

	async findAllByAggregate(
		pipeline,
		pipeLineWithSkipLimit,
	): Promise<FindAllResponse<Setting>> {
		const [count, items] = await Promise.all([
			this.settingModel.aggregate([...pipeline, { $count: 'total' }]).exec(),
			this.settingModel.aggregate(pipeLineWithSkipLimit),
		]);

		return {
			count: count[0]?.total || 0,
			items,
		};
	}
}

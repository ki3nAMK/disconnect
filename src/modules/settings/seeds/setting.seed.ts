import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from '@modules/settings/entities/setting.entity';
import { dataSetting } from '@modules/settings/seeds/data.seed';

@Injectable()
export class SettingSeed {
	constructor(
		@InjectModel(Setting.name)
		private model: Model<Setting>,
	) {}

	@Command({
		command: 'seed:settings',
		describe: 'Seed settings',
	})
	async create(): Promise<void> {
		await this.model.deleteMany({
			key: {
				$in: dataSetting.map((item) => item.key),
			},
		});

		await this.model.insertMany(dataSetting);
	}
}

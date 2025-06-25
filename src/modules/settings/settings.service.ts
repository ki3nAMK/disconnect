import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from '../../services/base/base.abstract.service';
import { Setting } from '@modules/settings/entities/setting.entity';
import { FilterSettingDto } from '@modules/settings/dto/filter-setting.dto';
import { SettingRepositoryInterface } from '@modules/settings/interfaces/setting.interface';
import { CreateSettingDto } from '@modules/settings/dto/create-setting.dto';
import { StringHelper } from '../../helpers/string.helper';
import * as fs from 'fs';

@Injectable()
export class SettingsService extends BaseServiceAbstract<Setting> {
	constructor(
		@Inject('SettingRepositoryInterface')
		private readonly settingRepository: SettingRepositoryInterface,
	) {
		super(settingRepository);
	}

	async findByKey({ key }: FilterSettingDto) {
		return {
			data: await super.findOneByCondition({ key }),
		};
	}

	async upsertSetting(createSettingDto: CreateSettingDto) {
		const { key, value } = createSettingDto;

		this._validateUpsertSetting(createSettingDto);

		const data = await this.settingRepository.upsertDocument(
			{
				key: key,
			},
			{
				value: value,
			},
		);

		return {
			data,
		};
	}

	_validateUpsertSetting(createSettingDto: CreateSettingDto) {
		const { key, value } = createSettingDto;

		switch (key) {
			default:
				this._validateAbilityIntroduces(value);
				break;
		}
	}

	_validateAbilityIntroduces(value) {
		if (value.length !== 5)
			throw new BadRequestException('Please enter video link');

		const videoNotInSystem = [];
		const videoNotCorrectFormat = [];
		const lengthValue = value.length;

		for (let i = 0; i < lengthValue; i++) {
			const fileLink = value[i];

			if (!StringHelper.isVideoExtensions(fileLink)) {
				videoNotCorrectFormat.push(i);
			}

			if (!fs.existsSync(fileLink)) {
				videoNotInSystem.push(i);
			}
		}

		if (videoNotCorrectFormat.length > 0) {
			throw new BadRequestException('Please enter the correct video format');
		}

		if (videoNotInSystem.length > 0) {
			throw new BadRequestException(
				`${videoNotInSystem[0]} URL does not exist on the system`,
			);
		}
	}
	//
	// findAll() {
	//   return `This action returns all settings`;
	// }

	// findOne(id: number): Promise<Setting> {
	// 	return `This action returns a #${id} setting`;
	// }

	// update(id: number, updateSettingDto: UpdateSettingDto) {
	//   return `This action updates a #${id} setting`;
	// }
	//
	// remove(id: number) {
	//   return `This action removes a #${id} setting`;
	// }
}

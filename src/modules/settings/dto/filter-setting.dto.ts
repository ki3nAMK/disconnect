import { IsOptional } from 'class-validator';
import { EKeySetting } from '@modules/settings/entities/setting.entity';

export class FilterSettingDto {
	@IsOptional()
	key: EKeySetting;
}

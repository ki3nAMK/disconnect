import { IsIn, IsNotEmpty } from 'class-validator';
import { EKeySetting } from '@modules/settings/entities/setting.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
	@IsNotEmpty()
	@IsIn([EKeySetting.ABILITY_CHECK_VIDEOS])
	key: EKeySetting;

	@IsNotEmpty()
	@ApiProperty({
		default: [],
	})
	value: any;
}

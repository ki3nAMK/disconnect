import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import * as moment from 'moment';
import { EStatusUser } from '../enums/index.enum';

export class UpdateDateExpiryUserDto {
	@ApiProperty({
		description: 'ステータス',
		required: false,
		default: EStatusUser.ACTIVE,
	})
	@IsOptional()
	status: EStatusUser;

	@ApiProperty({
		description: '有効期限',
		required: true,
		default: moment().format('YYYY-MM-DD'),
	})
	@IsNotEmpty()
	dateOfExpiry: string;
}

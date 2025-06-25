import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { EStatusUser } from '../enums/index.enum';

export class UpdateStatusUserDto {
	@ApiProperty({
		description: 'クラス',
		default: EStatusUser.ACTIVE,
	})
	@IsOptional()
	status: EStatusUser;
}

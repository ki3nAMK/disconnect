import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EGENDER, EStatusUser } from '../enums/index.enum';

export class CreateUserDto {
	@ApiProperty({
		description: '名前 *',
	})
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: 'アルファベット名 *',
	})
	@IsNotEmpty()
	alphabeticalName: string;

	@ApiProperty({
		description: 'アルファベット名 *',
	})
	@IsEnum(EGENDER)
	@IsOptional()
	gender: EGENDER;

	@ApiProperty({
		description: 'メールアドレス *',
		default: '@1bitlab.io',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description: '電話番号 *',
	})
	@IsNotEmpty()
	phone: string;

	@ApiProperty({
		description: '住所 *',
	})
	@IsNotEmpty()
	address: string;

	@ApiProperty({
		description: '生年月日 *',
		default: '1999-11-11',
	})
	@IsNotEmpty()
	dateOfBirth: Date;

	@ApiProperty({
		description: 'パスワード *',
		default: '12345678',
	})
	@Matches(/^[A-Za-z0-9]+$/, {
		message:
			'auths.password value must contain only numbers and alphabetic characters',
	})
	@IsNotEmpty()
	password: string;

	@ApiProperty({
		description: 'クラス',
		default: EStatusUser.ACTIVE,
	})
	@IsEnum(EStatusUser)
	@IsOptional()
	status: EStatusUser;
}

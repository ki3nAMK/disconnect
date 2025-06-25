import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class EmailDto {
	@ApiProperty({
		default: '@1bitlab.io',
	})
	// @Transform(params => {
	// 	return params?.value.toLowerCase();
	// })
	@IsNotEmpty({
		message: 'auths.Email is not empty',
	})
	@MaxLength(50)
	@IsEmail(
		{},
		{
			message: 'auths.Email is invalid',
		},
	)
	email: string;
}

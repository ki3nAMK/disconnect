import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailDto } from '../../../common/dto/email.dto';
import { EEnvironmentLogin } from '../enums';

export class ForgotPasswordDto extends EmailDto {
	@ApiProperty({
		default: EEnvironmentLogin.APP_STAFF,
	})
	@IsEnum(EEnvironmentLogin)
	environment: EEnvironmentLogin;
}

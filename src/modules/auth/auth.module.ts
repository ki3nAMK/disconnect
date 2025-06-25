import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { MailModule } from '@modules/mails/mail.module';
import { SharedModule } from '@modules/shared/shared.module';
import { TonProofService } from '@modules/auth/ton-proof.service';
import { TonApiService } from '@modules/auth/ton-api.service';
import { RoomsModule } from '@modules/rooms/rooms.module';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({}),
		MailModule,
		SharedModule,
		RoomsModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtAccessTokenStrategy,
		JwtRefreshTokenStrategy,
		TonProofService,
		TonApiService,
	],
})
export class AuthModule {}

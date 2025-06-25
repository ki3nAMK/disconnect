import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@modules/users/entities/user.entity';
import { UsersSeed } from '@modules/users/seeds/users.seed';
import { SettingSeed } from '@modules/settings/seeds/setting.seed';
import {
	Setting,
	SettingSchema,
} from '@modules/settings/entities/setting.entity';

@Module({
	imports: [
		CommandModule,
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Setting.name, schema: SettingSchema },
		]),
	],
	providers: [UsersSeed, SettingSeed],
})
export class SeedsModule {}

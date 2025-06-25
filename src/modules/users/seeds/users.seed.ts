import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { EGENDER, ERolesUser, EStatusUser } from '../enums/index.enum';

@Injectable()
export class UsersSeed {
	private SALT_ROUND;
	constructor(
		@InjectModel(User.name)
		private userModel: Model<User>,
		private readonly configService: ConfigService,
	) {
		this.SALT_ROUND = this.configService.get('SALT_ROUND');
	}

	@Command({
		command: 'seed:user',
		describe: 'Seed user',
	})
	async create(): Promise<void> {
		await this.userModel.deleteMany({
			email: {
				$in: ['admin@gmail.com', 'staff@gmail.com'],
			},
		});

		await this.userModel.insertMany([
			{
				email: 'admin@gmail.com',
				password: await this.getHashedPassword('12345678'),
				role: ERolesUser.ADMIN,
				status: EStatusUser.ACTIVE,
				accountId: 'admin',
				fullName: 'Admin',
				phone: '123456789',
				gender: EGENDER.FEMALE,
			},
			{
				email: 'staff@gmail.com',
				password: await this.getHashedPassword('12345678'),
				role: ERolesUser.STAFF,
				status: EStatusUser.ACTIVE,
				accountId: 'staff',
				fullName: 'STAFF',
				phone: '123456789',
				gender: EGENDER.FEMALE,
				salonId: '66fc042588ad2534cde24d46',
			},
		]);
	}

	async getHashedPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, this.SALT_ROUND);
	}
}

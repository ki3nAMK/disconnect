import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { User } from './entities/user.entity';
import { UsersRepositoryInterface } from './interfaces/users.interface';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ExcelService } from '@modules/excel/excel.service';
import mongoose from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { QueueService } from '@modules/queue/queue.service';

@Injectable()
export class UsersService extends BaseServiceAbstract<User> {
	private SALT_ROUND;

	constructor(
		@Inject('UsersRepositoryInterface')
		private readonly usersRepository: UsersRepositoryInterface,
		private readonly configService: ConfigService,
		private readonly excelService: ExcelService,
		@InjectConnection() private readonly connection: mongoose.Connection,
		private readonly queueService: QueueService,
	) {
		super(usersRepository);
		this.SALT_ROUND = this.configService.get<number>('SALT_ROUND');
	}

	async create(item: any): Promise<User> {
		return await this.usersRepository.create({
			...item,
		});
	}

	async findOneUserById(id: string): Promise<User> {
		const user = await this.usersRepository.findOneById(
			id,
			'-password -passwordResets -currentRefreshToken',
		);

		if (!user) {
			throw new NotFoundException('admins.User not found');
		}

		return user;
	}

	async getUserByEmail(email: string, options = {}): Promise<User> {
		return await this.usersRepository.findOneByCondition(
			{
				email,
				deletedAt: null,
			},
			options,
		);
	}

	async getUserByAccountId(accountId: string, options = {}): Promise<User> {
		return await this.usersRepository.findOneByCondition(
			{
				accountId,
				deletedAt: null,
			},
			options,
		);
	}

	async getUserWithRole(userId: string): Promise<User> {
		try {
			return await this.usersRepository.getUserWithRole(userId);
		} catch (error) {
			throw error;
		}
	}

	async setCurrentRefreshToken(id: string, hashedToken: string): Promise<void> {
		try {
			await this.usersRepository.update(id, {
				currentRefreshToken: hashedToken,
			});
		} catch (error) {
			throw error;
		}
	}

	async setCurrentAccessToken(
		id: string,
		uuidAccessToken: string,
	): Promise<void> {
		try {
			await this.usersRepository.update(id, {
				currentAccessToken: uuidAccessToken,
			});
		} catch (error) {
			throw error;
		}
	}

	async getHashedPassword(password: string): Promise<string> {
		return await bcrypt.hash(`${password}`, this.SALT_ROUND);
	}
}

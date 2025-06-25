import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import {
	accessTokenPrivateKey,
	refreshTokenPrivateKey,
} from 'src/constraints/jwt.constraint';
import { AppResponse, ResponseMessage } from '../../types/common.type';
import { MailService } from '@modules/mails/mail.service';
import { UpdatePasswordDto } from '@modules/auth/dto/update-password.dto';
import { SignInDto } from '@modules/auth/dto/sign-in.dto';
import { UpdateInfoDto } from '@modules/auth/dto/update-info.dto';
import { Observable } from 'rxjs';
import { escapeRegex, getTokenFromHeader } from '../../helpers/string.helper';
import { SharedService } from '@modules/shared/shared.service';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { EEnvironmentLogin } from '@modules/auth/enums';
import { ERolesUser, EStatusUser } from '@modules/users/enums/index.enum';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { RefreshTokenInterface, TokenPayload } from '@modules/auth/interfaces';
import { TonProofService } from '@modules/auth/ton-proof.service';
import { TonApiService } from '@modules/auth/ton-api.service';
import { CheckProofRequestDto } from '@modules/auth/dto';
import { Address } from '@ton/ton';
import { RoomsService } from '@modules/rooms/rooms.service';
import { isNil } from 'lodash';

@Injectable()
export class AuthService {
	private expTime;

	constructor(
		private configService: ConfigService,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailService: MailService,
		private readonly sharedService: SharedService,
		private readonly tonProofService: TonProofService,
		private readonly roomsService: RoomsService,
	) {
		this.expTime = this.configService.get<number>(
			'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
		);
	}

	async signIn(checkProofRequestDto: CheckProofRequestDto) {
		const tonApiService = TonApiService.create(checkProofRequestDto.network);

		const isValid = await this.tonProofService.checkProof(
			checkProofRequestDto,
			async (address: string) => {
				try {
					return await tonApiService.getWalletPublicKey(address);
				} catch (error) {
					console.error('Failed to get wallet public key:', error);
					throw new BadRequestException(
						'auths.Failed to get wallet public key',
					);
				}
			},
		);

		if (!isValid) {
			throw new BadRequestException('auths.Invalid proof');
		}

		const { fullName } = checkProofRequestDto;

		const rawAddress = Address.parse(checkProofRequestDto.address);

		const walletAddress = rawAddress.toString({
			bounceable: false,
			testOnly: true,
		});

		const { doc } = await this.usersService.findOrCreate(
			{
				walletAddress,
			},
			{
				walletAddress,
				fullName,
			},
		);

		const userId = doc.id;
		const uuidRefreshToken = this._getUuid();
		const uuidAccessToken = this._getUuid();

		const [accessToken, refreshToken] = await Promise.all([
			this.generateAccessToken({
				userId,
				uuidAccessToken,
			}),
			this.generateRefreshToken(
				{
					userId,
					uuidRefreshToken,
				},
				null,
			),
		]);

		await this.sharedService.storeUserAccessToken(userId, accessToken);

		return {
			data: {
				accessToken,
				refreshToken,
				user: doc,
				expTime: this.expTime,
			},
		};
	}

	async refreshAccessToken(req, res: Response) {
		const user = req?.user;
		const userId = user?.id;
		const payloadJwt = req.payloadJwt;
		const uuidRefreshToken = this._getUuid();
		const uuidAccessToken = this._getUuid();
		const newExp = payloadJwt.exp - moment().unix();

		const [accessToken, refreshToken] = await Promise.all([
			this.generateAccessToken({
				userId,
				uuidAccessToken,
			}),
			this.generateRefreshToken(
				{
					userId,
					uuidRefreshToken,
				},
				newExp,
			),
		]);

		await this.storeRefreshToken(userId, uuidRefreshToken);

		await this.setAccessTokenToCookies(res, accessToken, newExp);

		res.json({
			data: {
				accessToken,
				refreshToken,
				expTime: this.expTime,
			},
		});

		return {
			data: {
				accessToken,
				refreshToken,
				expTime: this.expTime,
			},
		};
	}

	async logOut(
		request: any,
	): Promise<AppResponse<boolean> | Observable<never>> {
		const token = getTokenFromHeader(request.headers); // Get the token from the header

		await this.sharedService.addTokenToBlacklist(token);

		return { data: true };
	}

	async updatePassword(
		user,
		{ password, oldPassword }: UpdatePasswordDto,
	): Promise<AppResponse<User> | Observable<never>> {
		try {
			const [isMatchingOldPassword] = await Promise.all([
				bcrypt.compare(oldPassword, user.password),
				this._checkSamePassword(password, user.password),
			]);

			//TODO: Separate the cases more widely
			if (!isMatchingOldPassword) {
				throw new BadRequestException(
					'auths.Please enter your previous password correctly',
				);
			}

			const hashedPassword = await this.usersService.getHashedPassword(
				password,
			);

			return {
				data: await this.usersService.update(user.id, {
					password: hashedPassword,
					firstLoginAt: new Date(),
				}),
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async updateInfo(
		user,
		dto: UpdateInfoDto,
	): Promise<AppResponse<User> | Observable<never>> {
		try {
			const { userName, email } = dto;

			if (userName) {
				const userExisted = await this.usersService.findOneByCondition({
					userName: {
						$regex: escapeRegex(userName),
						$options: 'i',
					},
				});

				if (userExisted && user.userName !== userName) {
					throw new ConflictException('User Name Already Exists!');
				}
			}

			if (email) {
				const userExisted = await this.usersService.findOneByCondition({
					email,
				});

				if (userExisted && user.userName !== email) {
					throw new ConflictException('Email existed!');
				}
			}

			return {
				data: await this.usersService.update(user.id, dto),
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async sendCodeOtp({
		email,
		environment,
	}: ForgotPasswordDto): Promise<ResponseMessage> {
		try {
			const user = await this.usersService.getUserByEmail(email);
			if (!user) {
				throw new BadRequestException('auths.Email address does not exist');
			}

			switch (environment) {
				case EEnvironmentLogin.APP_ADMIN:
					if (user.role === ERolesUser.STAFF) {
						throw new BadRequestException('auths.Email address does not exist');
					}
					break;
				case EEnvironmentLogin.APP_STAFF:
					if (user.role === ERolesUser.ADMIN) {
						throw new BadRequestException('auths.Email address does not exist');
					}
					break;
			}

			const code = this.getRndInteger(1000, 9999);

			this.mailService.forgotPassword(user, code);

			await this.usersService.update(user.id, {
				passwordResets: {
					code,
					createdAt: new Date(Date.now()),
				},
			});

			return {
				message: 'auths.Sent new opt code to your email',
			};
		} catch (error) {
			throw new UnprocessableEntityException(error.message);
		}
	}

	async _checkSamePassword(
		newPassword,
		oldPassword,
	): Promise<void | Observable<never>> {
		const isMatching = await bcrypt.compare(newPassword, oldPassword);
		if (isMatching) {
			throw new UnprocessableEntityException(
				'auths.New password is same old password',
			);
		}
	}

	getRndInteger(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	async getAuthenticatedUser(
		accountId: string,
		password: string,
		environment: EEnvironmentLogin,
	): Promise<User> {
		try {
			const user = await this.usersService.getUserByAccountId(accountId, {
				projection: '-currentRefreshToken -passwordResets',
			});

			if (!user) {
				throw new UnauthorizedException('auths.Incorrect username or password');
			}

			switch (environment) {
				case EEnvironmentLogin.APP_STAFF:
					if (ERolesUser.STAFF !== user.role)
						throw new UnauthorizedException(
							'auths.Incorrect username or password',
						);
					break;
				case EEnvironmentLogin.APP_ADMIN:
					if (ERolesUser.ADMIN !== user.role)
						throw new UnauthorizedException(
							'auths.Incorrect username or password',
						);
					break;
				default:
					throw new UnauthorizedException(
						'auths.Incorrect username or password',
					);
			}

			if (user.status === EStatusUser.INACTIVE) {
				throw new UnauthorizedException('auths.Login ID has expired');
			}

			return user;
		} catch (error) {
			throw new UnauthorizedException(error.message);
		}
	}

	private async verifyPlainContentWithHashedContent(
		plainText: string,
		hashedText: string,
	) {
		const isMatching = await bcrypt.compare(plainText, hashedText);
		if (!isMatching) {
			throw new BadRequestException('auths.Incorrect username or password');
		}
	}

	async getUserIfRefreshTokenMatched(
		userId: string,
		uuid: string,
	): Promise<User> {
		try {
			const user = await this.usersService.findOneByCondition({
				_id: userId,
			});

			// if (!user || user.currentRefreshToken !== uuid) {
			// 	throw new UnauthorizedException();
			// }

			return user;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async setAccessTokenToCookies(
		res: Response,
		accessToken,
		maxAge: number | null,
	): Promise<Response> {
		return res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge:
				1000 *
				(maxAge ||
					+this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME')),
		});
	}

	getAccessTokenFromCookies(req): string | null {
		return req?.cookies['accessToken'];
	}

	generateAccessToken(payload: TokenPayload): string {
		return this.jwtService.sign(payload, {
			algorithm: 'RS256',
			privateKey: accessTokenPrivateKey,
			expiresIn: `${this.configService.get<string>(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	generateRefreshToken(
		payload: RefreshTokenInterface,
		newExp: number | null,
	): string {
		const expiresIn = `${
			newExp ||
			this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
		}s`;

		return this.jwtService.sign(payload, {
			algorithm: 'RS256',
			privateKey: refreshTokenPrivateKey,
			expiresIn,
		});
	}

	_getUuid(): string {
		return uuidv4();
	}

	async storeRefreshToken(userId: string, uuid: string): Promise<void> {
		try {
			await this.usersService.setCurrentRefreshToken(userId, uuid);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async storeAccessToken(userId: string, uuid: string): Promise<void> {
		try {
			await this.usersService.setCurrentAccessToken(userId, uuid);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async signOut(user: User): Promise<{ success: boolean }> {
		const room = await this.roomsService.findRoomsByPlayerId(
			user._id.toString(),
		);

		if (isNil(room)) {
			console.log('Cannot find room that user joined!');

			return { success: true };
		}

		await this.roomsService.handleLeaveRoom(room._id.toString(), user);

		return { success: true };
	}
}

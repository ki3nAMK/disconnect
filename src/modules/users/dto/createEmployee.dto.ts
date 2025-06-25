import { ApiProperty } from '@nestjs/swagger';
import { EGENDER } from '../enums/index.enum';
import {
	IsEmail,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Length,
	Matches,
} from 'class-validator';
import { IsThumbnailExists, IsThumbnailPath } from '@common/dto/files';

export class CreateEmployeeDto {
	@ApiProperty({
		required: true,
	})
	@IsNotEmpty()
	@IsEmail(
		{},
		{
			message: 'admins.invalid email',
		},
	)
	email: string;

	@ApiProperty({
		required: true,
	})
	@IsNotEmpty({
		message: 'admins.fullName must be not empty',
	})
	@Matches(/^(?!\s*$).+/, {
		message: 'admins.fullName must be not empty',
	})
	@Matches(/^[^\s][a-zA-Z0-9\s]+[^\s]$/, {
		message: 'admins.invalid fullName',
	})
	fullName: string;

	@ApiProperty({
		required: true,
	})
	@IsNotEmpty()
	@IsNotEmpty({
		message: 'admins.accountId must be not empty',
	})
	@Matches(/^(?!\s*$).+/, {
		message: 'admins.accountId must be not empty',
	})
	@Matches(/^[^\s][a-zA-Z0-9\s]+[^\s]$/, {
		message: 'admins.invalid accountId',
	})
	accountId: string;

	@ApiProperty({
		required: true,
	})
	@IsNotEmpty({
		message: 'admins.password must be not empty',
	})
	@Length(6, 14, {
		message: 'admins.invalid password',
	})
	@Matches(/^[^\s][a-zA-Z0-9\s]+[^\s]$/, {
		message: 'admins.invalid password',
	})
	password: string;

	@ApiProperty({
		required: true,
	})
	@IsNotEmpty({
		message: 'admins.phone must be not empty',
	})
	@Length(10, 10, {
		message: 'admins.invalid phone',
	})
	@Matches(/^[0-9]+$/, {
		message: 'admins.invalid phone',
	})
	phone: string;

	@ApiProperty({
		required: true,
	})
	@IsEnum(EGENDER)
	gender: EGENDER;

	@ApiProperty({
		required: true,
	})
	@IsMongoId()
	salonId: string;

	@ApiProperty({
		required: true,
	})
	@IsNumber(
		{},
		{
			message: 'admins.invalid numeric character',
		},
	)
	@IsNotEmpty({
		message: 'admins.insuarance must be not empty',
	})
	taxesInsuarance: number;

	@ApiProperty({
		required: true,
	})
	@IsNumber(
		{},
		{
			message: 'admins.invalid numeric character',
		},
	)
	@IsNotEmpty({
		message: 'admins.Bank transfer must be not empty',
	})
	bankTransfer: number;

	@ApiProperty({
		required: true,
	})
	@IsNumber(
		{},
		{
			message: 'admins.invalid numeric character',
		},
	)
	@IsNotEmpty({
		message: 'admins.commissions must be not empty',
	})
	commissions: number;

	@ApiProperty({
		required: false,
		default: 'default avatar link',
	})
	@IsNotEmpty()
	@IsOptional()
	@IsThumbnailPath()
	@IsThumbnailExists()
	avatar: string;
}

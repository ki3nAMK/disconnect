import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EStatusRoom } from '../enums/index.enum';

export class PlayerDto {
	@ApiProperty({ type: String })
	@IsMongoId()
	@IsNotEmpty()
	playerId: string;

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	playerName: string;

	@ApiProperty({ type: Number, minimum: 1, maximum: 4 })
	@IsNumber()
	@Min(1)
	@Max(4)
	seatNumber: number;

	@ApiProperty({ type: Number, required: false })
	@IsOptional()
	@IsNumber()
	playingOrder?: number;
}

export class CreateRoomDto {
	@ApiProperty({ type: Boolean })
	@IsBoolean()
	isPro: boolean;

	@ApiProperty({ type: Number })
	@IsNumber()
	fee: number;

	@ApiProperty({
		enum: EStatusRoom,
		default: EStatusRoom.WAITING,
	})
	@IsEnum(EStatusRoom)
	@IsOptional()
	status?: EStatusRoom;
}

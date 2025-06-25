import { ApiProperty } from '@nestjs/swagger';
import {
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsString,
	Max,
	Min,
} from 'class-validator';

export class PreStartPlayerDto {
	@ApiProperty({ type: String })
	@IsMongoId()
	@IsNotEmpty()
	playerId: string;

	@ApiProperty({ type: Number, minimum: 1, maximum: 4 })
	@IsNumber()
	@Min(1)
	@Max(4)
	seatNumber: number;
}

export class StartRoomDto {
	@IsNotEmpty()
	players: PreStartPlayerDto[];
}

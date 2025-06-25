import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class RollDiceDto {
	@ApiProperty({ type: Number, minimum: 1, maximum: 6, required: false })
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(6)
	dice1: number;

	@ApiProperty({ type: Number, minimum: 1, maximum: 6, required: false })
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(6)
	dice2: number;
}

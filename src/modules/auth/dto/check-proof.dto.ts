import {
	IsNotEmpty,
	IsNumber,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DomainDto {
	@IsNumber()
	lengthBytes: number;

	@IsString()
	value: string;
}

export class ProofDto {
	@IsNumber()
	timestamp: number;

	@ValidateNested()
	@Type(() => DomainDto)
	domain: DomainDto;

	@IsString()
	payload: string;

	@IsString()
	@IsNotEmpty()
	signature: string;

	@IsString()
	@IsNotEmpty()
	stateInit: string;
}

export class CheckProofRequestDto {
	@IsString()
	address: string;

	@IsString()
	network: string;

	@IsString()
	@IsNotEmpty()
	publicKey: string;

	@IsString()
	fullName: string;

	@ValidateNested()
	@Type(() => ProofDto)
	@IsNotEmpty()
	proof: ProofDto;
}

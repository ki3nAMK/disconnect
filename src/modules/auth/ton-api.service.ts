import { Injectable } from '@nestjs/common';
import { Address, TonClient4 } from '@ton/ton';
import { Buffer } from 'buffer';
import { ConfigService } from '@nestjs/config';
import { CHAIN } from '@tonconnect/sdk';

@Injectable()
export class TonApiService {
	private readonly client: TonClient4;

	constructor(private readonly configService: ConfigService) {
		// Get endpoint from config
		const endpoint = this.configService.get<string>('TON_HUB_API');
		this.client = new TonClient4({ endpoint });
	}

	static createClient(network: CHAIN): TonClient4 {
		let endpoint: string;

		if (network === CHAIN.MAINNET) {
			endpoint = endpoint;
		} else if (network === CHAIN.TESTNET) {
			endpoint = 'https://testnet-v4.tonhubapi.com';
		} else {
			endpoint = 'https://testnet-v4.tonhubapi.com'; // default to testnet
		}

		return new TonClient4({ endpoint });
	}

	static create(network: string): TonApiService {
		const client = TonApiService.createClient(network as CHAIN);
		return new TonApiService(new ConfigService());
	}

	async getWalletPublicKey(address: string): Promise<Buffer> {
		const masterAt = await this.client.getLastBlock();
		const result = await this.client.runMethod(
			masterAt.last.seqno,
			Address.parse(address),
			'get_public_key',
			[],
		);
		return Buffer.from(
			result.reader.readBigNumber().toString(16).padStart(64, '0'),
			'hex',
		);
	}

	async getAccountInfo(address: string) {
		const masterAt = await this.client.getLastBlock();
		return await this.client.getAccount(
			masterAt.last.seqno,
			Address.parse(address),
		);
	}
}

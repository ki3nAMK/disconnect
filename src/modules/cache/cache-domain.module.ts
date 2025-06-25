import { Module } from '@nestjs/common';
import { CacheDomain } from './cache-domain.service';

@Module({
	imports: [],
	controllers: [],
	providers: [CacheDomain],
	exports: [CacheDomain],
})
export class CacheDomainModule {}

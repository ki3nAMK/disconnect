import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { SharedController } from './shared.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [JwtModule],
	controllers: [SharedController],
	providers: [SharedService],
	exports: [SharedService],
})
export class SharedModule {}

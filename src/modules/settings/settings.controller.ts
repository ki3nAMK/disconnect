import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { FilterSettingDto } from '@modules/settings/dto/filter-setting.dto';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiProperty,
	ApiTags,
} from '@nestjs/swagger';
import { CreateSettingDto } from '@modules/settings/dto/create-setting.dto';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { ERolesUser } from '@modules/users/enums/index.enum';

@Controller('settings')
@ApiTags('[App] Settings')
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) {}

	@Roles(ERolesUser.ADMIN)
	@UseGuards(RolesGuard)
	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({
		summary: 'Admin create or update ability check video and any setting',
		description: `* Only admin can use this API`,
	})
	@Post()
	async create(@Body() createSettingDto: CreateSettingDto) {
		return this.settingsService.upsertSetting(createSettingDto);
	}

	@ApiTags('[App] Settings')
	@ApiProperty({
		description: 'Get bank info',
	})
	@ApiOperation({
		summary: 'Get bank info',
	})
	@Get('/')
	findByKey(@Query() dto: FilterSettingDto) {
		return this.settingsService.findByKey(dto);
	}

	// @Get(':id')
	// findOne(@Param('id') id: string) {
	//   return this.settingsService.findOne(+id);
	// }
	//
	// @Patch(':id')
	// update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
	//   return this.settingsService.update(+id, updateSettingDto);
	// }
	//
	// @Delete(':id')
	// remove(@Param('id') id: string) {
	//   return this.settingsService.remove(+id);
	// }
}

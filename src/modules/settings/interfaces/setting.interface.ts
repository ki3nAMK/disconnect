import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { FindAllResponse } from '../../../types/common.type';
import { Setting } from '@modules/settings/entities/setting.entity';

export interface SettingRepositoryInterface
	extends BaseRepositoryInterface<Setting> {
	findAllByAggregate(
		pipeLine,
		pipeLineWithSkipLimit,
	): Promise<FindAllResponse<Setting>>;
}

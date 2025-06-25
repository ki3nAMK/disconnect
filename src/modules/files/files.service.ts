import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from '../../services/base/base.abstract.service';
import { Files } from '@modules/files/entities/file.entity';
import { FilesRepositoryInterface } from '@modules/files/interfaces/files.interface';
import { escapeRegex } from '../../helpers/string.helper';
import { _getSkipLimit } from '../../helpers/pagination.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FindAllResponse } from '../../types/common.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService extends BaseServiceAbstract<Files> {
	constructor(
		@Inject('FilesRepositoryInterface')
		private readonly filesRepository: FilesRepositoryInterface,
		private readonly configService: ConfigService,
	) {
		super(filesRepository);
	}

	async uploadFiles(files: Array<Express.Multer.File>) {
		const filesCreated = await this.filesRepository.insert(files);

		return {
			data: filesCreated,
		};
	}

	async findAll(dto: PaginationDto): Promise<FindAllResponse<Files>> {
		const { search, pageSize, page } = dto;
		const filter = {};

		if (search) {
			filter['filename'] = { $regex: escapeRegex(search), $options: 'i' };
		}

		const { $skip, $limit } = _getSkipLimit({ page, pageSize });

		const options = {
			sort: {
				createdAt: -1,
			},
			skip: $skip,
			limit: $limit,
			populate: '',
		};

		return this.filesRepository.findAll(filter, options);
	}
}

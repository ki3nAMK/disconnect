import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BaseEntity } from '@modules/shared/base/base.entity';

export type SettingDocument = mongoose.HydratedDocument<Setting>;

export enum EKeySetting {
	TIME_UPDATE_QUESTION = 'TIME_UPDATE_QUESTION',
	TIME_UPDATE_FILE = 'TIME_UPDATE_FILE',
	TIME_UPDATE_FILE_ZIP_MINI_GAME = 'TIME_UPDATE_FILE_ZIP_MINI_GAME',
	ABILITY_CHECK_VIDEOS = 'ABILITY_CHECK_VIDEOS',
}

export const EValueSetting = {
	ABILITY_CHECK_VIDEOS: [
		'assets/abilities/introduces/1_MVT2405.mp4',
		'assets/abilities/introduces/2_読解2405.mp4',
		'assets/abilities/introduces/3_記憶2405.mp4',
		'assets/abilities/introduces/4_認知2405.mp4',
		'assets/abilities/introduces/5_集中注意2405.mp4',
	],
};

@Schema({
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	},
	toJSON: {
		getters: true,
		virtuals: true,
	},
})
export class Setting extends BaseEntity {
	@Prop({
		required: true,
	})
	key: string;

	@Prop({
		type: mongoose.Schema.Types.Mixed,
	})
	value: any;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

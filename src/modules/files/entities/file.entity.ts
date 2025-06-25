import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@modules/shared/base/base.entity';

export type FilesDocument = HydratedDocument<Files>;

@Schema({
	timestamps: {
		createdAt: 'createdAt',
	},
	toJSON: {
		getters: true,
		virtuals: true,
	},
})
export class Files extends BaseEntity {
	@Prop({
		required: false,
	})
	path: string;

	@Prop({
		required: false,
	})
	filename: string;

	@Prop({
		required: false,
	})
	mimetype: string;
}
// fieldname: 'files',
// 	originalname: 'image-20231127-095122.png',
// 	encoding: '7bit',
// 	mimetype: 'image/png',
// 	destination: './assets/uploads',
// 	filename: '4310410_image-20231127-095122.png',
// 	path: 'assets\\uploads\\4310410_image-20231127-095122.png',

export const FilesSchema = SchemaFactory.createForClass(Files);
FilesSchema.index({ createdAt: -1 });
FilesSchema.index({ filename: 1 });

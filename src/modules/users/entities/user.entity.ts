import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ERolesUser, EStatusUser } from '../enums/index.enum';

export type UserDocument = HydratedDocument<User>;

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
export class User extends BaseEntity {
	@Prop({
		required: false,
		set: (val: string) => val.toLowerCase(),
	})
	email: string;

	@Prop({
		required: false,
	})
	telegramId: string;

	@Prop({
		required: true,
	})
	@ApiProperty({
		description: 'wallet address',
	})
	walletAddress: string;

	@Prop({
		required: false,
	})
	@ApiProperty({
		description: 'full name',
	})
	fullName: string;

	@Prop({
		required: false,
	})
	@ApiProperty({
		description: 'The link of the avatar image',
	})
	avatar: string;

	@Prop({
		required: false,
		default: EStatusUser.ACTIVE,
	})
	status: EStatusUser;

	@Prop({
		required: true,
		default: ERolesUser.USER,
	})
	role: ERolesUser;

	@Prop({
		required: false,
	})
	dob: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: -1, walletAddress: -1 });
UserSchema.index({ telegramId: -1 });

export const UserSchemaFactory = () => {
	const userSchema = UserSchema;

	return userSchema;
};

import { BaseEntity } from '@modules/shared/base/base.entity';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EStatusPlayer, EStatusRoom } from '../enums/index.enum';

export type RoomDocument = HydratedDocument<Room>;

export class Player {
	@ApiProperty({ type: String })
	playerId: Types.ObjectId;

	@ApiProperty({ type: String })
	playerName: string;

	@ApiProperty({ type: Number, minimum: 1, maximum: 4 })
	seatNumber: number;

	@ApiProperty({ type: Number, required: false })
	playingOrder?: number;

	@ApiProperty({ enum: EStatusPlayer, required: false })
	status: EStatusPlayer;
}

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
export class Room extends BaseEntity {
	@ApiProperty({ type: String })
	@Prop({ type: Types.ObjectId, required: true })
	ownerId: Types.ObjectId;

	@ApiProperty({
		type: [Player],
		description: 'Player list',
	})
	@Prop({
		type: [
			{
				playerId: { type: Types.ObjectId, required: true },
				playerName: { type: String, required: true },
				seatNumber: { type: Number, required: true, min: 1, max: 4 },
				playingOrder: { type: Number },
				status: {
					type: String,
					enum: Object.values(EStatusPlayer),
					default: EStatusPlayer.ONLINE,
				},
			},
		],
	})
	players: Player[];

	@ApiProperty({
		type: Boolean,
		description: 'true: Pro mode, false: Free mode',
	})
	@Prop({ type: Boolean, required: true })
	isPro: boolean;

	@ApiProperty({ type: Number })
	@Prop({ type: Number })
	fee: number;

	@ApiProperty({ type: String, required: false })
	@Prop({ type: Types.ObjectId })
	winnerId?: Types.ObjectId;

	@ApiProperty({
		enum: EStatusRoom,
		default: EStatusRoom.WAITING,
		description: 'Room Status',
	})
	@Prop({
		type: String,
		enum: Object.values(EStatusRoom),
		default: EStatusRoom.WAITING,
		required: true,
	})
	status: EStatusRoom;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
RoomSchema.index({ createdAt: -1 });

export const RoomSchemaFactory = () => {
	const roomSchema = RoomSchema;

	return roomSchema;
};

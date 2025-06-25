import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiExtraModels,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/requests.type';
import { CreateRoomDto } from './dto/create-room.dto';
import { StartRoomDto } from './dto/start-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities';
import { EStatusPlayer } from './enums/index.enum';
import { RoomsService } from './rooms.service';
import { CurrentUserDecorator } from '../../decorators/current-user.decorator';
import { User } from '@modules/users/entities';
import { GameStateInterface } from '@modules/games/interfaces';
import { GameStateResponseDto } from '@modules/games/dto/game-stage-response.dto';
import { RollDiceDto } from '@modules/rooms/dto/roll-dice.dto';

@ApiBearerAuth('token')
@Controller('rooms')
@ApiTags('[APP-User] Rooms')
@ApiExtraModels(GameStateResponseDto)
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@Post()
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Create a new room' })
	@ApiResponse({
		status: 201,
		description: 'Room successfully created.',
		type: Room,
	})
	async create(
		@Req() request: RequestWithUser,
		@Body() createRoomDto: CreateRoomDto,
	): Promise<{ data: Room; message: string }> {
		const { user } = request;

		const dto = {
			...createRoomDto,
			ownerId: user._id.toString(),
			players: [
				{
					playerId: user._id,
					playerName: user.fullName,
					seatNumber: 1,
					playingOrder: 1,
					status: EStatusPlayer.ONLINE,
				},
			],
		};

		const data = await this.roomsService.handleCreate(dto, user);

		return {
			data,
			message: 'Room successfully created',
		};
	}

	@Post(':roomId/game/roll-dice')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Roll dice' })
	@ApiResponse({
		status: 404,
		description: 'Room not found or has been deleted',
		example: {
			statusCode: 404,
			message: 'Room not found or has been deleted',
			error: 'Room not found or has been deleted',
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Room not started yet',
		example: {
			statusCode: 400,
			message: 'Room not started yet',
			error: 'Room not started yet',
		},
	})
	async rollDice(
		@Param('roomId') roomId: string,
		@CurrentUserDecorator() user: User,
		@Body() dto: RollDiceDto,
	): Promise<{ data: { room: Room; game: GameStateInterface } }> {
		return this.roomsService.rollDice(roomId, user, dto);
	}

	@Get(':id')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Get a room by id' })
	@ApiResponse({ status: 200, description: 'Return the room.' })
	@ApiResponse({ status: 404, description: 'Room not found.' })
	async findOne(
		@Param('id') id: string,
		@Req() request: RequestWithUser,
	): Promise<{ data: Room | null }> {
		const { user } = request;
		const room = await this.roomsService.handleGetRoomAndJoin(id, user);
		return {
			data: room,
		};
	}

	@Get(':roomId/game')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Get a game by room id' })
	@ApiResponse({
		status: 404,
		description: 'Room not found or has been deleted',
		example: {
			statusCode: 404,
			message: 'Room not found or has been deleted',
			error: 'Room not found or has been deleted',
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Room not started yet',
		example: {
			statusCode: 400,
			message: 'Room not started yet',
			error: 'Room not started yet',
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Returns room and game state',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						room: {
							type: 'object',
							$ref: '#/components/schemas/Room',
						},
						game: {
							type: 'object',
							$ref: '#/components/schemas/GameStateResponseDto',
						},
					},
				},
			},
		},
	})
	async findOneGame(
		@Param('roomId') roomId: string,
		@CurrentUserDecorator() user: User,
	): Promise<{ data: { room: Room; game: GameStateInterface } }> {
		return this.roomsService.findOneGame(roomId, user);
	}

	@Post(':id/leave')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Leave room' })
	async handleLeave(
		@Param('id') id: string,
		@Req() request: RequestWithUser,
	): Promise<{ success: boolean }> {
		const { user } = request;
		return await this.roomsService.handleLeaveRoom(id, user);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a room' })
	@ApiResponse({ status: 200, description: 'Room successfully updated.' })
	@ApiResponse({ status: 404, description: 'Room not found.' })
	update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
		return this.roomsService.update(id, updateRoomDto);
	}

	@Post(':id/start')
	@UseGuards(JwtAccessTokenGuard)
	@ApiOperation({ summary: 'Leave room' })
	async handleStartRoom(
		@Param('id') id: string,
		@Req() request: RequestWithUser,
		@Body() startRoomDto: StartRoomDto,
	): Promise<{ success: boolean }> {
		const { user } = request;
		console.log('startRoomDto: ', startRoomDto);
		return await this.roomsService.handleStartRoom(id, user, startRoomDto);
	}
}

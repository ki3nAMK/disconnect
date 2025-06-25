export interface PlayerStateInterface {
	playerId: string;
	playerName: string;
	seatNumber: number;

	position: number;
	balance: number;

	properties: number[];

	inJail: boolean;
	jailTurns: number;

	worldTourActive: boolean;
	bankrupt: boolean;

	doubleRollCount?: number;
	roundCount?: number;
}

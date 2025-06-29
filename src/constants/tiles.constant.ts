import { ETileTypeGame } from '@modules/games/enums/index.enum';

export const boardTiles = [
	{
		id: 0,
		tileName: 'Start',
		jpType: '特殊マス',
		tileType: ETileTypeGame.START,
		salary: 300000,
	},
	{
		id: 1,
		tileName: 'Bangkok',
		vnType: 'Thành phố',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 20000,
			apartment: 10000,
			building: 30000,
			hotel: 50000,
			landmark: 50000,
		},
		passingFee: {
			land: 2000,
			apartment: 6000,
			building: 20000,
			hotel: 50000,
			landmark: 256000,
		},
	},
	{
		id: 2,
		tileName: 'Game',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.EVENT_TILE,
	},
	{
		id: 3,
		tileName: 'Beijing',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 26000,
			apartment: 10000,
			building: 30000,
			hotel: 50000,
			landmark: 50000,
		},
		passingFee: {
			land: 2000,
			apartment: 8000,
			building: 22000,
			hotel: 60000,
			landmark: 250000,
		},
	},
	{
		id: 4,
		tileName: 'Okinawa',
		jpType: '水色観光地',
		tileType: ETileTypeGame.TOURIST_BLUE,
		pricing: {
			land: 100000,
		},
		passingFee: {
			land: 80000,
			apartment: 80000,
			building: 160000,
			hotel: null,
			landmark: null,
		},
	},
	{
		id: 5,
		tileName: 'Taipei',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 48000,
			apartment: 20000,
			building: 60000,
			hotel: 100000,
			landmark: 100000,
		},
		passingFee: {
			land: 6000,
			apartment: 18000,
			building: 46000,
			hotel: 120000,
			landmark: 450000,
		},
	},
	{
		id: 6,
		tileName: 'New Delhi',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 48000,
			apartment: 20000,
			building: 60000,
			hotel: 100000,
			landmark: 100000,
		},
		passingFee: {
			land: 6000,
			apartment: 18000,
			building: 46000,
			hotel: 120000,
			landmark: 450000,
		},
	},
	{
		id: 7,
		tileName: 'Cairo',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 54000,
			apartment: 20000,
			building: 60000,
			hotel: 100000,
			landmark: 100000,
		},
		passingFee: {
			land: 8000,
			apartment: 20000,
			building: 48000,
			hotel: 124000,
			landmark: 450000,
		},
	},
	{
		id: 8,
		tileName: 'Deserted Island',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.DESERTED_ISLAND,
	},
	{
		id: 9,
		tileName: 'Bali',
		jpType: 'ピンク観光地',
		tileType: ETileTypeGame.TOURIST_PINK,
		pricing: {
			land: 100000,
		},
		passingFee: {
			land: 80000,
			apartment: 80000,
			building: 160000,
			hotel: null,
			landmark: null,
		},
	},
	{
		id: 10,
		tileName: 'Seoul',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 72000,
			apartment: 30000,
			building: 90000,
			hotel: 150000,
			landmark: 150000,
		},
		passingFee: {
			land: 14000,
			apartment: 32000,
			building: 84000,
			hotel: 220000,
			landmark: 600000,
		},
	},
	{
		id: 11,
		tileName: 'Sydney',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 72000,
			apartment: 30000,
			building: 90000,
			hotel: 150000,
			landmark: 150000,
		},
		passingFee: {
			land: 14000,
			apartment: 32000,
			building: 84000,
			hotel: 220000,
			landmark: 600000,
		},
	},
	{
		id: 12,
		tileName: 'Chance',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.CHANCE,
	},
	{
		id: 13,
		tileName: 'Ottawa',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 94000,
			apartment: 40000,
			building: 120000,
			hotel: 200000,
			landmark: 200000,
		},
		passingFee: {
			land: 20000,
			apartment: 46000,
			building: 114000,
			hotel: 270000,
			landmark: 700000,
		},
	},
	{
		id: 14,
		tileName: 'Hawaii',
		jpType: '水色観光地',
		tileType: ETileTypeGame.TOURIST_BLUE,
		pricing: {
			land: 100000,
		},
		passingFee: {
			land: 80000,
			apartment: 80000,
			building: 160000,
			hotel: null,
			landmark: null,
		},
	},
	{
		id: 15,
		tileName: 'Sao Paulo',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 100000,
			apartment: 40000,
			building: 120000,
			hotel: 200000,
			landmark: 200000,
		},
		passingFee: {
			land: 24000,
			apartment: 48000,
			building: 118000,
			hotel: 280000,
			landmark: 700000,
		},
	},
	{
		id: 16,
		tileName: 'Carnival',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.CARNIVAL,
	},
	{
		id: 17,
		tileName: 'Prague',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 118000,
			apartment: 50000,
			building: 150000,
			hotel: 250000,
			landmark: 250000,
		},
		passingFee: {
			land: 32000,
			apartment: 70000,
			building: 168000,
			hotel: 380000,
			landmark: 750000,
		},
	},
	{
		id: 18,
		tileName: 'Phuket',
		jpType: '水色観光地',
		tileType: ETileTypeGame.TOURIST_BLUE,
		pricing: {
			land: 100000,
		},
		passingFee: {
			land: 80000,
			apartment: 80000,
			building: 160000,
			hotel: null,
			landmark: null,
		},
	},
	{
		id: 19,
		tileName: 'Berlin',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 124000,
			apartment: 50000,
			building: 150000,
			hotel: 250000,
			landmark: 250000,
		},
		passingFee: {
			land: 34000,
			apartment: 74000,
			building: 172000,
			hotel: 390000,
			landmark: 1420000,
		},
	},
	{
		id: 20,
		tileName: 'Chance',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.CHANCE,
	},
	{
		id: 21,
		tileName: 'Moscow',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 140000,
			apartment: 60000,
			building: 180000,
			hotel: 300000,
			landmark: 300000,
		},
		passingFee: {
			land: 44000,
			apartment: 86000,
			building: 200000,
			hotel: 460000,
			landmark: 750000,
		},
	},
	{
		id: 22,
		tileName: 'Geneva',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 146000,
			apartment: 60000,
			building: 180000,
			hotel: 300000,
			landmark: 300000,
		},
		passingFee: {
			land: 48000,
			apartment: 92000,
			building: 220000,
			hotel: 470000,
			landmark: 750000,
		},
	},
	{
		id: 23,
		tileName: 'Roma',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 146000,
			apartment: 60000,
			building: 180000,
			hotel: 300000,
			landmark: 300000,
		},
		passingFee: {
			land: 48000,
			apartment: 92000,
			building: 220000,
			hotel: 470000,
			landmark: 750000,
		},
	},
	{
		id: 24,
		tileName: 'World Travel',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.WORLD_TOUR,
	},
	{
		id: 25,
		tileName: 'Tahiti',
		jpType: 'ピンク観光地',
		tileType: ETileTypeGame.TOURIST_PINK,
		pricing: {
			land: 100000,
		},
		passingFee: {
			land: 80000,
			apartment: 80000,
			building: 160000,
			hotel: null,
			landmark: null,
		},
	},
	{
		id: 26,
		tileName: 'London',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 164000,
			apartment: 70000,
			building: 210000,
			hotel: 350000,
			landmark: 350000,
		},
		passingFee: {
			land: 56000,
			apartment: 124000,
			building: 280000,
			hotel: 600000,
			landmark: 1760000,
		},
	},
	{
		id: 27,
		tileName: 'Paris',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 170000,
			apartment: 70000,
			building: 210000,
			hotel: 350000,
			landmark: 350000,
		},
		passingFee: {
			land: 60000,
			apartment: 130000,
			building: 290000,
			hotel: 620000,
			landmark: 1800000,
		},
	},
	{
		id: 28,
		tileName: 'Chance',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.CHANCE,
	},
	{
		id: 29,
		tileName: 'New York',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 192000,
			apartment: 80000,
			building: 240000,
			hotel: 400000,
			landmark: 400000,
		},
		passingFee: {
			land: 72000,
			apartment: 148000,
			building: 320000,
			hotel: 680000,
			landmark: 1820000,
		},
	},
	{
		id: 30,
		tileName: 'Tax',
		jpType: '特殊イベント',
		tileType: ETileTypeGame.TAX,
	},
	{
		id: 31,
		tileName: 'Tokyo',
		jpType: '都市',
		tileType: ETileTypeGame.CITY,
		pricing: {
			land: 200000,
			apartment: 80000,
			building: 240000,
			hotel: 400000,
			landmark: 400000,
		},
		passingFee: {
			land: 80000,
			apartment: 160000,
			building: 340000,
			hotel: 700000,
			landmark: 1880000,
		},
	},
];

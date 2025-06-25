import { ObjectId } from 'mongodb';

export const RegexConstant = {
	password: new RegExp(/^[^\s\r\n\t]+$/),
	email: new RegExp(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	),
	sha256: new RegExp(/^[a-f0-9]{64}$/),
	phone: new RegExp(/^1?(\d{10,11})$/),
	dateFormatInCsv: new RegExp(/^\d{4}\/\d{1,2}\/\d{1,2}$/),
	dateFormatIsoInCsv: new RegExp(
		/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
	),
	postCodeInCsv: new RegExp(/^\d{7}$/),
	phoneInCsv: new RegExp(/^\d{10,11}$/),
	yearMonthInCsv: new RegExp(/^\d{4}\/(0?[1-9]|1[0-2])$/),
	furiganaInCsv: new RegExp(/^[\u3040-\u309F\u30A0-\u30FFー　 ]+$/),
	ageInCsv: new RegExp(/^\d+$/),
	videoExtensions: new RegExp(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i),
};

export const StringHelper = {
	isEmail: (value: string): boolean => {
		return RegexConstant.email.test(value);
	},
	isDateFormatInCsv: (value: string): boolean => {
		return RegexConstant.dateFormatInCsv.test(value);
	},
	isDateIsoFormatInCsv: (value: string): boolean => {
		return RegexConstant.dateFormatIsoInCsv.test(value);
	},
	isYearMonthInCsv: (value: string): boolean => {
		return RegexConstant.yearMonthInCsv.test(value);
	},
	isPostCodeInCsv: (value: string): boolean => {
		return RegexConstant.postCodeInCsv.test(value);
	},
	isPhoneInCsv: (value: string): boolean => {
		return RegexConstant.phoneInCsv.test(value);
	},
	isFuriganaInCsv: (value: string): boolean => {
		return RegexConstant.furiganaInCsv.test(value);
	},
	isAgeInCsv: (value: any): boolean => {
		return (
			value && value >= 1 && value <= 150 && RegexConstant.ageInCsv.test(value)
		);
	},
	isVideoExtensions: (value: string): boolean => {
		return RegexConstant.videoExtensions.test(value);
	},
};

export const escapeRegex = (string) => {
	return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const extractTokenFromRequest = (request): string => {
	// Extract the token from the Authorization header
	const authorizationHeader = request?.headers?.authorization;
	if (authorizationHeader && authorizationHeader?.startsWith('Bearer ')) {
		return authorizationHeader.slice(7); // 'Bearer ' is 7 characters long
	}

	return null;
};

export const randomNumber = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const convertToObjectId = (id: string): ObjectId => {
	return new ObjectId(id);
};

export function getRandomEnumValue<T>(
	anEnum: T,
	excludedValue?: T[keyof T],
): T[keyof T] {
	const enumValues = Object.values(anEnum);
	let filteredValues = enumValues;
	if (excludedValue) {
		filteredValues = enumValues.filter((value) => value !== excludedValue);
	}
	const randomIndex = Math.floor(Math.random() * filteredValues.length);
	return filteredValues[randomIndex];
}

export function getTokenFromHeader(headers: {
	[key: string]: string;
}): string | undefined {
	const authHeader = headers['authorization'];
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.split(' ')[1]; // Return the token part
	}
	return undefined; // Return undefined if no token is found
}

import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import * as moment from 'moment'; // Optional: You can also use native JS Date object

@ValidatorConstraint({ async: false })
export class IsAfterStartTimeConstraint
	implements ValidatorConstraintInterface
{
	validate(endTime: string, args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		const startTime = (args.object as any)[relatedPropertyName];

		// Parse the provided times, e.g., "14:30:00"
		const start = moment(startTime, true); // Start time
		const end = moment(endTime, true); // End time

		// Ensure both start and end times are valid and end is after start
		return start.isValid() && end.isValid() && end.isAfter(start);
	}

	defaultMessage(args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		return `End time must be after the ${relatedPropertyName}`;
	}
}

export function IsAfterStartTime(
	property: string,
	validationOptions?: ValidationOptions,
) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [property],
			validator: IsAfterStartTimeConstraint,
		});
	};
}

@ValidatorConstraint({ async: false })
export class IsSameDayConstraint implements ValidatorConstraintInterface {
	validate(endDate: Date, args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		const startTime = (args.object as any)[relatedPropertyName];

		// Compare the two dates to check if they are the same day
		return moment(startTime).isSame(endDate, 'day');
	}

	defaultMessage(args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		return `End date must be on the same day as ${relatedPropertyName}`;
	}
}

export function IsSameDay(
	property: string,
	validationOptions?: ValidationOptions,
) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [property],
			validator: IsSameDayConstraint,
		});
	};
}

@ValidatorConstraint({ async: false })
export class IsAfterNowConstraint implements ValidatorConstraintInterface {
	validate(date: Date) {
		// Ensure the provided date is valid
		return (
			moment(date, moment.ISO_8601, true).isValid() &&
			moment(date).isAfter(moment())
		);
	}

	defaultMessage(args: ValidationArguments) {
		return `The date must be after the current time`;
	}
}

// Create the decorator function
export function IsAfterNow(validationOptions?: ValidationOptions) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: IsAfterNowConstraint, // Pass the class directly
		});
	};
}

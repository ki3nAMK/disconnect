import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
} from 'class-validator';

export function NoSpecialCharacters(validationOptions?: ValidationOptions) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			name: 'noSpecialCharacters',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					// Check if the value contains special characters or spaces
					const regex = /^[a-zA-Z0-9]*$/; // Only allows letters and numbers
					return typeof value === 'string' && regex.test(value);
				},
				defaultMessage(args: ValidationArguments) {
					// Customize your error message here
					return `${args.property} should not contain special characters or spaces`;
				},
			},
		});
	};
}

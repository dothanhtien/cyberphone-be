import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints as [string];

          const obj = args.object as Record<string, unknown>;
          const relatedValue = obj[relatedPropertyName];

          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedPropertyName] = args.constraints as [string];
          return `${propertyName} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}

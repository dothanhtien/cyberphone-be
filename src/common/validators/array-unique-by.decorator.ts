import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function ArrayUniqueBy<T>(
  property: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'arrayUniqueBy',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: T[], args: ValidationArguments): boolean {
          if (!Array.isArray(value)) return false;

          const constraints = args.constraints as [keyof T];
          const prop = constraints[0];

          const values = value.map((item) => item?.[prop]);
          const uniqueValues = new Set(values);

          return values.length === uniqueValues.size;
        },

        defaultMessage(args: ValidationArguments): string {
          const constraints = args.constraints as [keyof T];
          const prop = constraints[0];

          return `${String(prop)} must not contain duplicate values`;
        },
      },
    });
  };
}

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function ValidateDateRange(
  startKey: string,
  endKey: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateDateRange',
      target: object.constructor,
      propertyName,
      constraints: [startKey, endKey],
      options: validationOptions,
      validator: {
        validate(_: unknown, args: ValidationArguments): boolean {
          const constraints = args.constraints as [string, string];
          const [startKey, endKey] = constraints;
          const obj = args.object as Record<string, unknown>;
          const start = obj[startKey];
          const end = obj[endKey];

          if (!start || !end) return true;

          const startDate = new Date(start as string);
          const endDate = new Date(end as string);

          return startDate.getTime() <= endDate.getTime();
        },

        defaultMessage(args: ValidationArguments): string {
          const constraints = args.constraints as [string, string];
          const [startKey, endKey] = constraints;
          return `${startKey} must be less than or equal to ${endKey}`;
        },
      },
    });
  };
}

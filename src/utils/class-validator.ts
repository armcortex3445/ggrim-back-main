import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsInArrayConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [allowedValues] = args.constraints;
    return Array.isArray(allowedValues) && allowedValues.includes(value);
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const [allowedValues] = validationArguments.constraints;
    return `Value must be one of the following : ${JSON.stringify(allowedValues)}`;
  }
}

export function IsInArray(validValues: any[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isInArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [validValues],
      options: validationOptions,
      validator: IsInArrayConstraint,
    });
  };
}

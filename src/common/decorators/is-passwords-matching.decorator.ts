import { SignUpBody } from 'src/modules/auth/presenter/bodies/sign-up.body';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatching implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const obj = args.object as SignUpBody;
    return obj.password === confirmPassword;
  }

  defaultMessage(): string {
    return 'Пароли не совпадают';
  }
}

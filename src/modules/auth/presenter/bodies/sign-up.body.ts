import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import { IsPasswordsMatching } from 'src/common/decorators/is-passwords-matching.decorator';

export class SignUpBody {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsPasswordsMatching)
  confirmPassword: string;
}

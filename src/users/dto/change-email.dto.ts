import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class ChangeEmailDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsEmail()
  newEmail: string;
}

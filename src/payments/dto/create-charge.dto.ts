import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateChargeDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  country_code: string; // e.g., "965"

  @IsNotEmpty()
  @IsString()
  phone_number: string; // e.g., "51234567"

  @IsOptional()
  @IsNumber()
  amount?: number; // Optional, defaults to 1 if not provided

  @IsOptional()
  @IsString()
  description?: string; // Optional, defaults to a standard description
}
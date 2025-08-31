import { IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class UpdateProfilePremiumDto {

  @IsOptional()
  @IsBoolean()
  premium?: boolean;
}

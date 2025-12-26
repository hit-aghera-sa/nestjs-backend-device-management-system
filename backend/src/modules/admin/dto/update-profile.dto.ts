import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

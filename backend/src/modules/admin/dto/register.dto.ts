import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsIn(["ADMIN", "MASTER"])
  role?: "ADMIN" | "MASTER";
}

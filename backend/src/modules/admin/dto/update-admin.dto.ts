import { IsBoolean, IsEmail, IsOptional, IsString, MinLength, MaxLength, IsIn } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['MASTER', 'ADMIN'])
  role?: 'MASTER' | 'ADMIN';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

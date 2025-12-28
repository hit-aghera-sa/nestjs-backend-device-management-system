// src/modules/assignment/dto/filter-assignments.dto.ts
import { IsOptional, IsUUID, IsString } from 'class-validator';

export class FilterAssignmentsDto {
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'RETURNED';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}

import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  deviceId!: string;

  @IsUUID()
  employeeId!: string;

  @IsDateString()
  assignedDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

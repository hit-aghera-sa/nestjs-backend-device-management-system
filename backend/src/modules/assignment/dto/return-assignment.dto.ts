import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReturnAssignmentDto {
  @IsDateString()
  returnDate!: string;

  @IsOptional()
  @IsString()
  conditionNotes?: string;
}
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { DeviceStatus } from '../device.entity';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceName!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  modelNumber?: string;

  @IsString()
  @IsNotEmpty()
  serialNumber!: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsDateString()
  @IsOptional()
  expectedReturnDate?: string;

  @IsEnum(['AVAILABLE', 'ASSIGNED', 'DAMAGED', 'MAINTENANCE'])
  @IsOptional()
  status?: DeviceStatus;

  @IsString()
  @IsOptional()
  specifications?: string;
}

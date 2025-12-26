import { IsEnum } from 'class-validator';
import { DeviceStatus } from '../device.entity';

export class UpdateDeviceStatusDto {
  @IsEnum(['AVAILABLE', 'ASSIGNED', 'DAMAGED', 'MAINTENANCE'])
  status!: DeviceStatus;
}

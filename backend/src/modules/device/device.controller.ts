import { Query, Controller, Get, Post, Patch, Put, Delete, Param, Body } from '@nestjs/common';
import { DeviceService } from './device.service';
import { successResponse } from '../../core/utils/response.util';

import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { UpdateDeviceStatusDto } from './dto/update-device-status.dto';
import { ListDevicesDto } from './dto/list-devices.dto';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // CREATE
  @Post()
  async createDevice(@Body() dto: CreateDeviceDto) {
    const device = await this.deviceService.createDevice(dto);

    return successResponse(device, 'Device created successfully');
  }

  // LIST
  @Get()
  async getDevices(@Query() query: ListDevicesDto) {
    const list = await this.deviceService.listDevices(query);
    return successResponse(list);
  }

  // GET BY ID
  @Get(':id')
  async getDeviceById(@Param('id') id: string) {
    const device = await this.deviceService.getDeviceById(id);

    return successResponse(device);
  }

  // UPDATE FULL DEVICE
  @Put(':id')
  async updateDevice(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    const updated = await this.deviceService.updateDevice(id, dto);

    return successResponse(updated, 'Device updated successfully');
  }

  // UPDATE STATUS
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceStatusDto,
  ) {
    const updated = await this.deviceService.updateStatus(id, dto.status);

    return successResponse(updated, 'Device status updated successfully');
  }

  // DELETE
  @Delete(':id')
  async deleteDevice(@Param('id') id: string) {
    await this.deviceService.deleteDevice(id);

    return successResponse(null, 'Device deleted successfully');
  }
}

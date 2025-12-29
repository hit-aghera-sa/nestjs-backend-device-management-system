import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Device } from "./device.entity";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { Assignment } from "../assignment/assignment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Device, Assignment])],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Assignment } from "../assignment/assignment.entity";
import { Device } from "../device/device.entity";
import { Employee } from "../employee/employee.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Device, Employee])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

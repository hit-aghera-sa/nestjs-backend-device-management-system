import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Assignment } from "./assignment.entity";
import { AssignmentController } from "./assignment.controller";
import { AssignmentService } from "./assignment.service";
import { Employee } from "../employee/employee.entity";
import { Device } from "../device/device.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Employee, Device])],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}

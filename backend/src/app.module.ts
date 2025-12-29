import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppDataSource } from "./config/typeorm.config";
import { AdminModule } from "./modules/admin/admin.module";
import { EmployeeModule } from "./modules/employee/employee.module";
import { DeviceModule } from "./modules/device/device.module";
import { AssignmentModule } from "./modules/assignment/assignment.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { StockModule } from "./modules/stock/stock.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,  
      synchronize: false       
    }),

    AdminModule,
    EmployeeModule,
    DeviceModule,
    AssignmentModule,
    DashboardModule,
    StockModule
  ],
})
export class AppModule {}

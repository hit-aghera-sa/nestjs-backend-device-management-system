import { Module } from "@nestjs/common";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "../device/device.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}

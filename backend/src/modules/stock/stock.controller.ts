import { Controller, Get, UseGuards } from "@nestjs/common";
import { StockService } from "./stock.service";
import { successResponse } from "../../core/utils/response.util";
import { AuthGuard } from "../../core/guards/auth.guard";

@Controller("stock")
@UseGuards(AuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get("available")
  async getAvailableStock() {
    const data = await this.stockService.getAvailableStock();
    return successResponse(data);
  }

  @Get("low")
  async getLowStock() {
    const data = await this.stockService.getLowStock();
    return successResponse(data);
  }
}

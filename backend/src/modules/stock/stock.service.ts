import { AppDataSource } from "../../config/typeorm.config";
import { Device } from "../device/device.entity";

export class StockService {
  private readonly LOW_STOCK_THRESHOLD = 5;

  async getAvailableStock() {
    const repo = AppDataSource.getRepository(Device);

    const raw = await repo
      .createQueryBuilder("device")
      .select("device.category", "category")
      .addSelect("COUNT(*)", "total")
      .addSelect(
        `SUM(CASE WHEN device.status = 'AVAILABLE' THEN 1 ELSE 0 END)`,
        "available"
      )
      .groupBy("device.category")
      .getRawMany();

    return raw.map(r => ({
      category: r.category,
      total: Number(r.total),
      available: Number(r.available),
    }));
  }

  async getLowStock() {
    const stock = await this.getAvailableStock();

    return stock
      .filter(item => item.available < this.LOW_STOCK_THRESHOLD)
      .map(item => ({
        category: item.category,
        available: item.available,
        threshold: this.LOW_STOCK_THRESHOLD,
      }));
  }
}

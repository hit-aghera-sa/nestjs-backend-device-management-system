import { Request, Response, NextFunction } from "express";
import StockService from "./stock.service";
import { successResponse } from "../../core/utils/response.util";

class StockController {
  async getAvailableStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StockService.getAvailableStock();
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StockService.getLowStock();
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }
}

export default new StockController();

import { Request, Response, NextFunction } from "express";
import DashboardService from "./dashboard.service";
import { successResponse } from "../../core/utils/response.util";

class DashboardController {
  // ----------------------------------------
  // GET /dashboard/overview
  // ----------------------------------------
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getOverview();
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------
  // GET /dashboard/recent?limit=10
  // ----------------------------------------
  async getRecentAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const data = await DashboardService.getRecentAssignments(limit);
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------
  // GET /dashboard/category-stats
  // ----------------------------------------
  async getCategoryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getCategoryStats();
      return res.status(200).json(successResponse(stats));
    } catch (err) {
      next(err);
    }
  }
}

export default new DashboardController();

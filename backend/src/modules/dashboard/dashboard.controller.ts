import { Controller, Get } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service";
import { successResponse } from "../../core/utils/response.util";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("overview")
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.dashboardService.getOverview();
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  @Get("recent")
  async getRecentAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const data = await this.dashboardService.getRecentAssignments(limit);
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  @Get("stats")
  async getCategoryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.dashboardService.getCategoryStats();
      return res.status(200).json(successResponse(stats));
    } catch (err) {
      next(err);
    }
  }
}

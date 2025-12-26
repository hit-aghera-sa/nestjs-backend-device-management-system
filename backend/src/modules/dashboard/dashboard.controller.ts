import { Controller, Get, Req, Res, Next, UseGuards } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service";
import { successResponse } from "../../core/utils/response.util";
import { AuthGuard } from "../../core/guards/auth.guard";

@UseGuards(AuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("overview")
  async getOverview(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    try {
      const data = await this.dashboardService.getOverview();
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  @Get("recent")
  async getRecentAssignments(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const data = await this.dashboardService.getRecentAssignments(limit);
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  @Get("stats")
  async getCategoryStats(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    try {
      const stats = await this.dashboardService.getCategoryStats();
      return res.status(200).json(successResponse(stats));
    } catch (err) {
      next(err);
    }
  }
}

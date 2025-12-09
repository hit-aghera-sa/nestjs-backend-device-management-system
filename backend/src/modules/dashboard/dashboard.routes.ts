import { Router } from "express";
import DashboardController from "./dashboard.controller";

const router = Router();

router.get("/overview", DashboardController.getOverview);
router.get("/recent", DashboardController.getRecentAssignments);
router.get("/stats", DashboardController.getCategoryStats);

export default router;

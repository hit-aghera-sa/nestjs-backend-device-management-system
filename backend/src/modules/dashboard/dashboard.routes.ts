import { Router } from "express";
import DashboardController from "./dashboard.controller";
import authMiddleware from "../../core/middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/overview", DashboardController.getOverview);
router.get("/recent", DashboardController.getRecentAssignments);
router.get("/stats", DashboardController.getCategoryStats);

export default router;

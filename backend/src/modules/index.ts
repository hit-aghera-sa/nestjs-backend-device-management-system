import { Router } from "express";
import healthRoutes from "./health/health.routes";
import adminRoutes from "./admin/admin.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", adminRoutes);

// export aggregated router
export default router;


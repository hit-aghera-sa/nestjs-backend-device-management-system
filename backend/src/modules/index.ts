import { Router } from "express";
import healthRoutes from "./health/health.routes";
import adminRoutes from "./admin/admin.routes";
import employeeRoutes from "./employee/employee.routes";
import deviceRoutes from "./device/device.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", adminRoutes);
router.use("/employees", employeeRoutes);
router.use("/devices", deviceRoutes);

export default router;


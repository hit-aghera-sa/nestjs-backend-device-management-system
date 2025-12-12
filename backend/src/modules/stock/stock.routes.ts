import { Router } from "express";
import StockController from "./stock.controller";
import authMiddleware from "../../core/middleware/auth.middleware";
const router = Router();
router.use(authMiddleware);

router.get("/available", StockController.getAvailableStock);
router.get("/low", StockController.getLowStock);

export default router;

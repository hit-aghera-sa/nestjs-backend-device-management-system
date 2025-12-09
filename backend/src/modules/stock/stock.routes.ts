import { Router } from "express";
import StockController from "./stock.controller";

const router = Router();

router.get("/available", StockController.getAvailableStock);
router.get("/low", StockController.getLowStock);

export default router;

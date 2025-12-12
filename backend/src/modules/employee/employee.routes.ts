import { Router } from "express";
import EmployeeController from "./employee.controller";
import { validate } from "../../core/middleware/validation.middleware";
import authMiddleware from "../../core/middleware/auth.middleware";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  resendVerificationSchema,
} from "./employee.validator";

const router = Router();
router.use(authMiddleware);

// CRUD
router.post("/", validate(createEmployeeSchema), EmployeeController.createEmployee);
router.get("/", EmployeeController.getEmployees);
router.get("/:id", EmployeeController.getEmployeeById);
router.patch("/:id", validate(updateEmployeeSchema), EmployeeController.updateEmployee);
router.delete("/:id", EmployeeController.deleteEmployee);

// Verification
router.get("/verify/:token", EmployeeController.verifyEmployee);
router.post("/resend-verification", validate(resendVerificationSchema), EmployeeController.resendVerification);

export default router;


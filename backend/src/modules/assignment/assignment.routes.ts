import { Router } from "express";
import AssignmentController from "./assignment.controller";
import { validate } from "../../core/middleware/validation.middleware";
import {
  assignDeviceSchema,
  returnDeviceSchema,
} from "./assignment.validator";

const router = Router();

// Assign a device to an employee
router.post("/", validate(assignDeviceSchema), AssignmentController.assignDevice);

// Return device
router.post(
  "/:id/return",
  validate(returnDeviceSchema),
  AssignmentController.returnDevice
);

// Fetch a single assignment
router.get("/:id", AssignmentController.getAssignmentById);

// List all assignments
router.get("/", AssignmentController.listAssignments);

export default router;

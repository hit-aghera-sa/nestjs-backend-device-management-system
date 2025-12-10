import { Router } from "express";
import AssignmentController from "./assignment.controller";
import { validate } from "../../core/middleware/validation.middleware";
import {
  assignDeviceSchema,
  returnDeviceSchema,
} from "./assignment.validator";

const router = Router();

router.post("/", validate(assignDeviceSchema), AssignmentController.assignDevice);

router.post(
  "/:id/return",
  validate(returnDeviceSchema),
  AssignmentController.returnDevice
);

router.get("/:id", AssignmentController.getAssignmentById);

router.get("/", AssignmentController.listAssignments);
router.delete("/:id", AssignmentController.deleteAssignment);


export default router;

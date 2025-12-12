import { Router } from "express";
import DeviceController from "./device.controller";
import { validate } from "../../core/middleware/validation.middleware";
import authMiddleware from "../../core/middleware/auth.middleware";
import {
  createDeviceSchema,
  updateDeviceSchema,
  updateDeviceStatusSchema,
} from "./device.validator";

const router = Router();
router.use(authMiddleware);

router.post("/", validate(createDeviceSchema), DeviceController.createDevice);
router.get("/", DeviceController.getDevices);
router.get("/:id", DeviceController.getDeviceById);
router.put("/:id", validate(updateDeviceSchema), DeviceController.updateDevice);
router.patch(
  "/:id/status",
  validate(updateDeviceStatusSchema),
  DeviceController.updateStatus
);
router.delete("/:id", DeviceController.deleteDevice);

export default router;

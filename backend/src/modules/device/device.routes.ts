import { Router } from "express";
import DeviceController from "./device.controller";
import { validate } from "../../core/middleware/validation.middleware";
import {
  createDeviceSchema,
  updateDeviceSchema,
} from "./device.validator";

const router = Router();

router.post("/", validate(createDeviceSchema), DeviceController.createDevice);
router.get("/", DeviceController.getDevices);
router.get("/:id", DeviceController.getDeviceById);
router.patch("/:id", validate(updateDeviceSchema), DeviceController.updateDevice);
router.delete("/:id", DeviceController.deleteDevice);

export default router;


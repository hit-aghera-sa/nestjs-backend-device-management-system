import { Request, Response, NextFunction } from "express";
import DeviceService from "./device.service";
import { successResponse } from "../../core/utils/response.util";

class DeviceController {
  async createDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await DeviceService.createDevice(req.body);
      return res
        .status(201)
        .json(successResponse(device, "Device created successfully"));
    } catch (err) {
      next(err);
    }
  }

  async getDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const devices = await DeviceService.listDevices(req.query);
      return res.status(200).json(successResponse(devices));
    } catch (err) {
      next(err);
    }
  }

  async getDeviceById(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await DeviceService.getDeviceById(req.params.id);
      return res.status(200).json(successResponse(device));
    } catch (err) {
      next(err);
    }
  }

  async updateDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await DeviceService.updateDevice(req.params.id, req.body);
      return res
        .status(200)
        .json(successResponse(updated, "Device updated successfully"));
    } catch (err) {
      next(err);
    }
  }

  async deleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      await DeviceService.deleteDevice(req.params.id);
      return res
        .status(200)
        .json(successResponse(null, "Device deleted successfully"));
    } catch (err) {
      next(err);
    }
  }
}

export default new DeviceController();


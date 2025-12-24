import { Controller, Post, Get, Patch, Put, Delete, Param, Body, Req, Res } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { DeviceService } from "./device.service";
import { successResponse } from "../../core/utils/response.util";

@Controller("device")
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async createDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await this.deviceService.createDevice(req.body);
      return res
        .status(201)
        .json(successResponse(device, "Device created successfully"));
    } catch (err) {
      next(err);
    }
  }

  @Get()
  async getDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await this.deviceService.listDevices(req.query);
      return res.status(200).json(successResponse(list));
    } catch (err) {
      next(err);
    }
  }

  @Get(":id")
  async getDeviceById(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await this.deviceService.getDeviceById(req.params.id);
      return res.status(200).json(successResponse(device));
    } catch (err) {
      next(err);
    }
  }

  @Put(":id")
  async updateDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await this.deviceService.updateDevice(
        req.params.id,
        req.body
      );
      return res
        .status(200)
        .json(successResponse(updated, "Device updated successfully"));
    } catch (err) {
      next(err);
    }
  }

  @Patch(":id/status")
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await this.deviceService.updateStatus(
        req.params.id,
        req.body.status
      );
      return res
        .status(200)
        .json(successResponse(updated, "Device status updated successfully"));
    } catch (err) {
      next(err);
    }
  }

  @Delete(":id")
  async deleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      await this.deviceService.deleteDevice(req.params.id);
      return res
        .status(200)
        .json(successResponse(null, "Device deleted successfully"));
    } catch (err) {
      next(err);
    }
  }
}

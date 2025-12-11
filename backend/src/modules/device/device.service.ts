import DeviceRepository from "./device.repository";
import { IDevice, DeviceStatus } from "./device.model";
import AppError from "../../core/errors/AppError";
import { logger } from "../../core/logger/logger";
import AssignmentRepository from "../assignment/assignment.repository";

class DeviceService {

  async createDevice(data: Partial<IDevice>) {
    const exists = await DeviceRepository.findBySerial(data.serialNumber!);
    if (exists) throw new AppError("Device with this serial number already exists", 400);

    const device = await DeviceRepository.create({
      deviceName: data.deviceName,
      category: data.category?.toLocaleLowerCase(),
      brand: data.brand || null,
      modelNumber: data.modelNumber || null,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate || null,
      warrantyExpiry: data.warrantyExpiry || null,
      purchasePrice: data.purchasePrice || null,
      specifications: data.specifications || null,
      expectedReturnDate: data.expectedReturnDate || null,
      status: data.status || "AVAILABLE",
    });

    return device;
  }

  async listDevices(filter: any = {}) {
    const dbFilter: any = {};

    if (filter.category) {
      dbFilter.category = filter.category;
    }

    if (filter.status) {
      dbFilter.status = filter.status;
    }

    if (filter.search) {
      dbFilter.$or = [
        { deviceName: { $regex: filter.search, $options: "i" } },
        { serialNumber: { $regex: filter.search, $options: "i" } },
        { modelNumber: { $regex: filter.search, $options: "i" } },
      ];
    }

    return DeviceRepository.findAll(dbFilter);
  }

  async getDeviceById(id: string) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);
    return device;
  }

  async updateDevice(id: string, data: Partial<IDevice>) {
    const device = await DeviceRepository.update(id, data);
    if (!device) throw new AppError("Device not found", 404);
    return device;
  }


  async deleteDevice(id: string) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);

    const activeAssignment = await AssignmentRepository.findActiveByDevice(id);
    if (activeAssignment) {
      throw new AppError("Cannot delete a device that is assigned to an employee", 400);
    }

    return await DeviceRepository.delete(id);
  }

  async updateStatus(id: string, status: DeviceStatus) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);

    // You cannot manually set ASSIGNED
    if (status === "ASSIGNED") {
      throw new AppError("Cannot manually set device status to ASSIGNED", 400);
    }

    // If device is currently assigned, allow ONLY assignment service to change it
    if (device.status === "ASSIGNED") {
      throw new AppError("Cannot change status of an assigned device", 400);
    }

    const updated = await DeviceRepository.update(id, { status });
    return updated;
  }
}

export default new DeviceService();
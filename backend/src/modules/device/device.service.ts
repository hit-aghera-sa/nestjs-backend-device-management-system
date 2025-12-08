import DeviceRepository from "./device.repository";
import { IDevice } from "./device.model";
import AppError from "../../core/errors/AppError";
import { logger } from "../../core/logger/logger";

class DeviceService {
  // ----------------------------
  // Create Device
  // ----------------------------
  async createDevice(data: Partial<IDevice>) {
    const exists = await DeviceRepository.findBySerial(data.serialNumber!);
    if (exists) throw new AppError("Device with this serial number already exists", 400);

    const device = await DeviceRepository.create({
      deviceName: data.deviceName,
      category: data.category,
      brand: data.brand || null,
      modelNumber: data.modelNumber || null,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate || null,
      warrantyExpiry: data.warrantyExpiry || null,
      purchasePrice: data.purchasePrice || null,
      specifications: data.specifications || null,
      status: data.status || "AVAILABLE",
    });

    return device;
  }

  // ----------------------------
  // List Devices
  // Supports filter by category/status/search
  // ----------------------------
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

  // ----------------------------
  // Get Device by ID
  // ----------------------------
  async getDeviceById(id: string) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);
    return device;
  }

  // ----------------------------
  // Update Device
  // Prevent certain status updates until assignment module is done
  // ----------------------------
  async updateDevice(id: string, data: Partial<IDevice>) {
    const device = await DeviceRepository.update(id, data);
    if (!device) throw new AppError("Device not found", 404);
    return device;
  }

  // ----------------------------
  // Delete Device
  // Prevent deletion if device is assigned
  // Placeholder until Assignment Module
  // ----------------------------
  async deleteDevice(id: string) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);

    // Placeholder logic — will be replaced after Assignment Module
    const hasActiveAssignment = device.status === "ASSIGNED";
    if (hasActiveAssignment) {
      throw new AppError("Cannot delete device while assigned to an employee", 400);
    }

    const deleted = await DeviceRepository.delete(id);
    return deleted;
  }
}

export default new DeviceService();


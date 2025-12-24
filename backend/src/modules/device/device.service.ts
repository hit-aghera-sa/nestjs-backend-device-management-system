import DeviceRepository from "./device.repository";
import { DeviceStatus } from "./device.entity";
import AppError from "../../core/errors/AppError";
import AssignmentRepository from "../assignment/assignment.repository";
import { Like } from "typeorm";

export class DeviceService {
  async createDevice(data: any) {
    const exists = await DeviceRepository.findBySerial(data.serialNumber);
    if (exists) {
      throw new AppError(
        "Device with this serial number already exists",
        400
      );
    }

    return DeviceRepository.create({
      deviceName: data.deviceName,
      category: data.category?.toLowerCase(),
      brand: data.brand ?? null,
      modelNumber: data.modelNumber ?? null,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate ?? null,
      warrantyExpiry: data.warrantyExpiry ?? null,
      purchasePrice: data.purchasePrice ?? null,
      specifications: data.specifications ?? null,
      expectedReturnDate: data.expectedReturnDate ?? null,
      status: data.status ?? "AVAILABLE",
    });
  }

  async listDevices(query: any = {}) {
    const baseWhere: any = {};

    if (query.category && query.category !== "ALL") {
      baseWhere.category = query.category;
    }

    if (query.status && query.status !== "ALL") {
      baseWhere.status = query.status;
    }

    let where: any = baseWhere;

    // ✅ STRICT $or PARITY WITH MONGOOSE
    if (query.search) {
      where = [
        {
          ...baseWhere,
          deviceName: Like(`%${query.search}%`),
        },
        {
          ...baseWhere,
          serialNumber: Like(`%${query.search}%`),
        },
        {
          ...baseWhere,
          modelNumber: Like(`%${query.search}%`),
        },
      ];
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [devices, total] =
      await DeviceRepository["repo"].findAndCount({
        where,
        skip,
        take: limit,
        order: { createdAt: "DESC" },
      });

    return {
      devices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDeviceById(id: string) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);
    return device;
  }

  async updateDevice(id: string, data: any) {
    const device = await DeviceRepository.update(id, data);
    if (!device) throw new AppError("Device not found", 404);
    return device;
  }

  async deleteDevice(id: string) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);

    const activeAssignment =
      await AssignmentRepository.findActiveByDevice(id);

    if (activeAssignment) {
      throw new AppError(
        "Cannot delete a device that is assigned to an employee",
        400
      );
    }

    return DeviceRepository.delete(id);
  }

  async updateStatus(id: string, status: DeviceStatus) {
    const device = await DeviceRepository.findById(id);
    if (!device) throw new AppError("Device not found", 404);

    if (status === "ASSIGNED") {
      throw new AppError(
        "Cannot manually set device status to ASSIGNED",
        400
      );
    }

    if (device.status === "ASSIGNED") {
      throw new AppError(
        "Cannot change status of an assigned device",
        400
      );
    }

    return DeviceRepository.update(id, { status });
  }
}

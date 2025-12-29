import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { Device, DeviceStatus } from './device.entity';
import AppError from '../../core/errors/AppError';
import { Assignment } from '../assignment/assignment.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly repo: Repository<Device>,

    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
  ) {}

  // ------------------------------------------------
  // CREATE DEVICE
  // ------------------------------------------------
  async createDevice(data: any) {
    const exists = await this.repo.findOne({
      where: { serialNumber: data.serialNumber },
    });

    if (exists) {
      throw new AppError(
        'Device with this serial number already exists',
        400,
      );
    }

    const device = this.repo.create({
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
      status: (data.status as DeviceStatus) ?? 'AVAILABLE',
    });

    return this.repo.save(device);
  }

  // ------------------------------------------------
  // LIST DEVICES
  // ------------------------------------------------
  async listDevices(query: any = {}) {
    const baseWhere: any = {};

    if (query.category && query.category !== 'ALL') {
      baseWhere.category = query.category;
    }

    if (query.status && query.status !== 'ALL') {
      baseWhere.status = query.status;
    }

    let where: any = baseWhere;

    if (query.search) {
      where = [
        { ...baseWhere, deviceName: Like(`%${query.search}%`) },
        { ...baseWhere, serialNumber: Like(`%${query.search}%`) },
        { ...baseWhere, modelNumber: Like(`%${query.search}%`) },
      ];
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [devices, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
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

  // ------------------------------------------------
  // GET DEVICE
  // ------------------------------------------------
  async getDeviceById(id: string) {
    const device = await this.repo.findOne({ where: { id } });
    if (!device) throw new AppError('Device not found', 404);
    return device;
  }

  // ------------------------------------------------
  // UPDATE DEVICE
  // ------------------------------------------------
  async updateDevice(id: string, data: any) {
    await this.repo.update(id, data);
    return this.getDeviceById(id);
  }

  // ------------------------------------------------
  // DELETE DEVICE
  // ------------------------------------------------
  async deleteDevice(id: string) {
    const device = await this.getDeviceById(id);

    // 🔥 NEW — TypeORM repo instead of deleted custom repo
    const activeAssignment = await this.assignmentRepo.findOne({
      where: {
        device: { id },
        status: 'ASSIGNED',
      },
      relations: ['device'],
    });

    if (activeAssignment) {
      throw new AppError(
        'Cannot delete a device that is assigned to an employee',
        400,
      );
    }

    await this.repo.remove(device);
    return true;
  }

  // ------------------------------------------------
  // UPDATE STATUS
  // ------------------------------------------------
  async updateStatus(id: string, status: DeviceStatus) {
    const device = await this.getDeviceById(id);

    if (status === 'ASSIGNED') {
      throw new AppError(
        'Cannot manually set device status to ASSIGNED',
        400,
      );
    }

    if (device.status === 'ASSIGNED') {
      throw new AppError(
        'Cannot change status of an assigned device',
        400,
      );
    }

    await this.repo.update(id, { status });
    return this.getDeviceById(id);
  }
}

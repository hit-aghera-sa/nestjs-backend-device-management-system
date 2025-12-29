// src/modules/assignment/assignment.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  Between,
} from 'typeorm';

import { Assignment } from './assignment.entity';
import { Device, DeviceStatus } from '../device/device.entity';
import { Employee } from '../employee/employee.entity';
import AppError from '../../core/errors/AppError';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,

    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  // ---------------------------
  // ASSIGN DEVICE
  // ---------------------------
  async assignDevice(data: {
    employeeId: string;
    deviceId: string;
    notes?: string;
    expectedReturnDate?: string | Date | null;
  }) {
    const { employeeId, deviceId, notes, expectedReturnDate } = data;

    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!employee) throw new AppError('Employee not found', 404);

    if (!employee.isVerified) {
      throw new AppError(
        'Employee must verify email before assignment',
        400,
      );
    }

    const device = await this.deviceRepo.findOne({
      where: { id: deviceId },
    });

    if (!device) throw new AppError('Device not found', 404);

    if (device.status !== 'AVAILABLE') {
      throw new AppError(
        'Device is not available for assignment',
        400,
      );
    }

    const existingEmployeeAssignment =
      await this.assignmentRepo.findOne({
        where: {
          employee: { id: employeeId },
          status: 'ASSIGNED',
        },
        relations: ['employee'],
      });

    if (existingEmployeeAssignment) {
      throw new AppError(
        'This employee already has an active assigned device',
        400,
      );
    }

    const assignment = this.assignmentRepo.create({
      employee,
      device,
      notes: notes ?? null,
      assignedAt: new Date(),
      status: 'ASSIGNED',
      employeeName: employee.fullName,
      deviceName: device.deviceName,
      deviceCategory: device.category,
      expectedReturnDate: expectedReturnDate
        ? new Date(expectedReturnDate)
        : null,
    });

    await this.assignmentRepo.save(assignment);

    await this.deviceRepo.update(device.id, {
      status: 'ASSIGNED',
    });

    return assignment;
  }

  // ---------------------------
  // RETURN DEVICE
  // ---------------------------
  async returnDevice(
    assignmentId: string,
    notes: string,
    deviceStatus: DeviceStatus,
  ) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['device'],
    });

    if (!assignment) throw new AppError('Assignment not found', 404);

    if (assignment.status !== 'ASSIGNED') {
      throw new AppError(
        'This assignment is already returned',
        400,
      );
    }

    if (!assignment.device?.id) {
      throw new AppError('Unable to extract device ID', 500);
    }

    assignment.status = 'RETURNED';
    assignment.returnedAt = new Date();
    assignment.notes = notes ?? null;

    await this.assignmentRepo.save(assignment);

    await this.deviceRepo.update(assignment.device.id, {
      status: deviceStatus,
    });

    return assignment;
  }

  // ---------------------------
  // GET BY ID
  // ---------------------------
  async getAssignmentById(id: string) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['device', 'employee'],
    });

    if (!assignment) throw new AppError('Assignment not found', 404);

    return assignment;
  }

  // ---------------------------
  // LIST
  // ---------------------------
  async listAssignments(filter: any = {}) {
    const baseWhere: any = {};

    if (filter.status) baseWhere.status = filter.status;

    if (filter.startDate || filter.endDate) {
      baseWhere.assignedAt = Between(
        filter.startDate ? new Date(filter.startDate) : new Date(0),
        filter.endDate ? new Date(filter.endDate) : new Date(),
      );
    }

    let where: any = baseWhere;

    if (filter.search) {
      where = [
        { ...baseWhere, employeeName: Like(`%${filter.search}%`) },
        { ...baseWhere, deviceName: Like(`%${filter.search}%`) },
        { ...baseWhere, deviceCategory: Like(`%${filter.search}%`) },
        { ...baseWhere, notes: Like(`%${filter.search}%`) },
      ];
    }

    const page = parseInt(filter.page || '1', 10);
    const limit = parseInt(filter.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [data, total] = await this.assignmentRepo.findAndCount({
      where,
      relations: ['device', 'employee'],
      skip,
      take: limit,
      order: { assignedAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  // ---------------------------
  // DELETE
  // ---------------------------
  async deleteAssignment(id: string) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['device'],
    });

    if (!assignment) throw new AppError('Assignment not found', 404);

    if (!assignment.device?.id) {
      throw new AppError('Unable to extract device ID', 500);
    }

    await this.deviceRepo.update(assignment.device.id, {
      status: 'AVAILABLE',
    });

    await this.assignmentRepo.remove(assignment);

    return { deleted: true };
  }

  async getHistory(employeeId?: string, deviceId?: string) {

    const where: any = {};

    if (employeeId) where.employee = { id: employeeId };
    if (deviceId) where.device = { id: deviceId };

    const history = await this.assignmentRepo.find({
        where,
        relations: ['employee', 'device'],
        order: { assignedAt: 'DESC' },
    });

    return history;
    }

    async getActiveAssignmentCount() {
        return this.assignmentRepo.count({
            where: { status: 'ASSIGNED' }
        });
    }

}

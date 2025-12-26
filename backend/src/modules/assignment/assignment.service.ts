import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';

import AssignmentRepository from './assignment.repository';
import DeviceRepository from '../device/device.repository';
import AppError from '../../core/errors/AppError';
import { DeviceStatus } from '../device/device.entity';
import { Employee } from '../employee/employee.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async assignDevice(data: {
    employeeId: string;
    deviceId: string;
    notes?: string;
    expectedReturnDate?: string | Date | null;
  }) {
    const { employeeId, deviceId, notes, expectedReturnDate } = data;

    // 🔥 REPLACED — now uses TypeORM repo
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

    const device = await DeviceRepository.findById(deviceId);
    if (!device) throw new AppError('Device not found', 404);
    if (device.status !== 'AVAILABLE') {
      throw new AppError('Device is not available for assignment', 400);
    }

    const existingEmployeeAssignment =
      await AssignmentRepository.findActiveByEmployee(employeeId);

    if (existingEmployeeAssignment) {
      throw new AppError(
        'This employee already has an active assigned device',
        400,
      );
    }

    const assignment = await AssignmentRepository.create({
      employee,
      device,
      notes: notes ?? null,
      assignedAt: new Date(),
      employeeName: employee.fullName,
      deviceName: device.deviceName,
      deviceCategory: device.category,
      expectedReturnDate: expectedReturnDate
        ? new Date(expectedReturnDate)
        : null,
    });

    await DeviceRepository.update(deviceId, { status: 'ASSIGNED' });

    return assignment;
  }

  async returnDevice(
    assignmentId: string,
    notes: string,
    deviceStatus: DeviceStatus,
  ) {
    const assignment = await AssignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);

    if (assignment.status !== 'ASSIGNED') {
      throw new AppError('This assignment is already returned', 400);
    }

    if (!assignment.device || !assignment.device.id) {
      throw new AppError('Unable to extract device ID', 500);
    }

    const updatedAssignment =
      await AssignmentRepository.markReturned(assignmentId, notes);

    await DeviceRepository.update(assignment.device.id, {
      status: deviceStatus,
    });

    return updatedAssignment;
  }

  async getAssignmentById(id: string) {
    const assignment = await AssignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', 404);
    return assignment;
  }

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

    const [data, total] = await AssignmentRepository.listAssignments(
      where,
      skip,
      limit,
    );

    return { data, total, page, limit };
  }

  async deleteAssignment(id: string) {
    const assignment = await AssignmentRepository.findById(id);
    if (!assignment) throw new AppError('Assignment not found', 404);

    if (!assignment.device || !assignment.device.id) {
      throw new AppError('Unable to extract device ID', 500);
    }

    await DeviceRepository.update(assignment.device.id, {
      status: 'AVAILABLE',
    });

    await AssignmentRepository.delete(id);

    return { deleted: true };
  }
}

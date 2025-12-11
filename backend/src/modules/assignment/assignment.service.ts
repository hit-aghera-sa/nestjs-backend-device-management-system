import AssignmentRepository from "./assignment.repository";
import EmployeeRepository from "../employee/employee.repository";
import DeviceRepository from "../device/device.repository";
import { IAssignment } from "./assignment.model";
import AppError from "../../core/errors/AppError";
import mongoose from "mongoose";
import { logger } from "../../core/logger/logger";
import { DeviceStatus } from "../device/device.model";

class AssignmentService {
  // ----------------------------
  // Assign a device to an employee
  // ----------------------------
  async assignDevice(data: { employeeId: string; deviceId: string; notes?: string, expectedReturnDate?: string | Date | null;  }) {
    const { employeeId, deviceId, notes } = data;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new AppError("Invalid employee ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      throw new AppError("Invalid device ID", 400);
    }
    // Validate employee
    const employee = await EmployeeRepository.findById(employeeId);
    if (!employee) throw new AppError("Employee not found", 404);
    if (!employee.isVerified) throw new AppError("Employee must verify email before assignment", 400);

    // Validate device
    const device = await DeviceRepository.findById(deviceId);
    if (!device) throw new AppError("Device not found", 404);
    if (device.status !== "AVAILABLE") {
      throw new AppError("Device is not available for assignment", 400);
    }

    // Check for existing assignment for employee
    const existingEmployeeAssignment = await AssignmentRepository.findActiveByEmployee(employeeId);
    if (existingEmployeeAssignment) {
      throw new AppError("This employee already has an active assigned device", 400);
    }

    // Create assignment
    const assignment = await AssignmentRepository.create({
      employee: new mongoose.Types.ObjectId(employeeId),
      device: new mongoose.Types.ObjectId(deviceId),
      notes: notes || null,
      assignedAt: new Date(),
      employeeName: employee.fullName,
      deviceName: device.deviceName,
      deviceCategory: device.category,
      expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
    });

    // Update device status → ASSIGNED
    await DeviceRepository.update(deviceId, { status: "ASSIGNED" });

    return assignment;
  }

  async returnDevice(assignmentId: string, notes: string, deviceStatus: string) {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new AppError("Invalid assignment ID", 400);
    }

    const assignment = await AssignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError("Assignment not found", 404);

    if (assignment.status !== "ASSIGNED") {
      throw new AppError("This assignment is already returned", 400);
    }

    // Mark assignment as returned
    const updatedAssignment = await AssignmentRepository.markReturned(
      assignmentId,
      notes
    );

    // Safely extract deviceId
    const deviceField = assignment.device as mongoose.Types.ObjectId | { _id: any } | null;

    const deviceId =
      deviceField instanceof mongoose.Types.ObjectId
        ? deviceField.toString()
        : deviceField?._id?.toString();
    

    if (!deviceId) {
      throw new AppError("Unable to extract device ID", 500);
    }

    // Update device status to selected option
    await DeviceRepository.update(deviceId, { status: deviceStatus as DeviceStatus });

    return updatedAssignment;
  }

  async getAssignmentById(id: string) {
    const assignment = await AssignmentRepository.findById(id);
    if (!assignment) throw new AppError("Assignment not found", 404);
    return assignment;
  }

  async listAssignments(filter: any = {}) {
    const dbFilter: any = {};

    // Status
    if (filter.status) dbFilter.status = filter.status;

    // Employee Name Search
    if (filter.employee) {
      dbFilter.employeeName = { $regex: filter.employee, $options: "i" };
    }

    // Device Category
    if (filter.deviceCategory) {
      dbFilter.deviceCategory = { $regex: filter.deviceCategory, $options: "i" };
    }

    // Date Range
    if (filter.startDate || filter.endDate) {
      dbFilter.assignedAt = {};
      if (filter.startDate) dbFilter.assignedAt.$gte = new Date(filter.startDate);
      if (filter.endDate) dbFilter.assignedAt.$lte = new Date(filter.endDate);
    }

    // Search
    if (filter.search) {
      dbFilter.$or = [
        { employeeName: { $regex: filter.search, $options: "i" } },
        { deviceName: { $regex: filter.search, $options: "i" } },
        { deviceCategory: { $regex: filter.search, $options: "i" } },
        { notes: { $regex: filter.search, $options: "i" } }
      ];
    }

  // Pagination
  const page = parseInt(filter.page || "1", 10);
  const limit = parseInt(filter.limit || "10", 10);
  const skip = (page - 1) * limit;

  const data = await AssignmentRepository.listAssignments(dbFilter)
    .skip(skip)
    .limit(limit);

  const total = await AssignmentRepository.count(dbFilter);

  return { data, total, page, limit };
}



  async deleteAssignment(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid assignment ID", 400);
  }

  const assignment = await AssignmentRepository.findById(id);
  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  // When deleting assignment → Make device AVAILABLE again
  await DeviceRepository.update(
    assignment.device.toString(),
    { status: "AVAILABLE" }
  );

  await AssignmentRepository.delete(id);

  return { deleted: true };
}

}

export default new AssignmentService();



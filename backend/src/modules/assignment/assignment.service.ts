import AssignmentRepository from "./assignment.repository";
import EmployeeRepository from "../employee/employee.repository";
import DeviceRepository from "../device/device.repository";
import { IAssignment } from "./assignment.model";
import AppError from "../../core/errors/AppError";
import mongoose from "mongoose";
import { logger } from "../../core/logger/logger";

class AssignmentService {
  // ----------------------------
  // Assign a device to an employee
  // ----------------------------
  async assignDevice(data: { employeeId: string; deviceId: string; notes?: string }) {
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
    if (device.status === "ASSIGNED") {
      throw new AppError("Device is already assigned to another employee", 400);
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
    });

    // Update device status → ASSIGNED
    await DeviceRepository.update(deviceId, { status: "ASSIGNED" });

    return assignment;
  }

  // ----------------------------
  // Return a device from assignment
  // ----------------------------

  async returnDevice(assignmentId: string, notes?: string) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw new AppError("Invalid assignment ID", 400);
  }

  const assignment = await AssignmentRepository.findById(assignmentId);
  if (!assignment) throw new AppError("Assignment not found", 404);

  if (assignment.status !== "ASSIGNED") {
    throw new AppError("This assignment is already returned", 400);
  }

  console.log("first DEBUG assignment.device =", assignment.device);

  // Mark assignment as returned
  const updatedAssignment = await AssignmentRepository.markReturned(
    assignmentId,
    notes
  );

  // Extract deviceId safely
  const deviceId =
    assignment.device instanceof mongoose.Types.ObjectId
      ? assignment.device.toString()
      : assignment.device._id.toString();

  // Update device → AVAILABLE
  await DeviceRepository.update(deviceId, { status: "AVAILABLE" });

  console.log("second DEBUG deviceId =", deviceId);

  return updatedAssignment;
}


  // ----------------------------
  // Get assignment details by ID
  // ----------------------------
  async getAssignmentById(id: string) {
    const assignment = await AssignmentRepository.findById(id);
    if (!assignment) throw new AppError("Assignment not found", 404);
    return assignment;
  }

  // ----------------------------
  // List all assignments + filters
  // ----------------------------
  async listAssignments(filter: any = {}) {
    const dbFilter: any = {};

    if (filter.status) dbFilter.status = filter.status;
    if (filter.employeeId) dbFilter.employee = filter.employeeId;
    if (filter.deviceId) dbFilter.device = filter.deviceId;

    return AssignmentRepository.listAssignments(dbFilter);
  }
}

export default new AssignmentService();



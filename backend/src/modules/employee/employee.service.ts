import crypto from "crypto";
import EmployeeModel from "./employee.model";
import EmployeeRepository from "./employee.repository";
import { IEmployee } from "./employee.model";
import AppError from "../../core/errors/AppError";
import { sendEmail } from "../../core/utils/email.util";
import { logger } from "../../core/logger/logger";
import AssignmentRepository from "../assignment/assignment.repository";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class EmployeeService {

  async createEmployee(data: Partial<IEmployee>) {
    const existing = await EmployeeRepository.findByEmail(data.email!);
    if (existing) throw new AppError("Email already exists", 400);

    const employee = await EmployeeRepository.create({
      fullName: data.fullName,
      email: data.email,
      department: data.department,
      designation: data.designation ?? undefined,
      contactNumber: data.contactNumber ?? undefined,
      isVerified: false,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

    await EmployeeRepository.setVerificationToken(employee._id.toString(), token, expires);

    try {
      const verifyLink = `${process.env.BACKEND_ORIGIN}/api/employees/verify/${token}`;
      const html = `
        <p>Hello ${employee.fullName},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyLink}">Verify Employee Email</a>
      `;

      await sendEmail(employee.email, "Verify your employee account", html);
    } catch (err) {
      logger.error("Employee verification email send failed", err as Error);
    }

    return employee;
  }

  async listEmployees(query: any = {}) {
    const dbFilter: any = {};

    // filters …
    if (query.status) dbFilter.status = query.status;

    if (query.isVerified === "true") dbFilter.isVerified = true;
    else if (query.isVerified === "false") dbFilter.isVerified = false;

    if (query.department) {
      dbFilter.department = { $regex: query.department, $options: "i" };
    }

    if (query.search) {
      const search = query.search;
      dbFilter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }


    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query using mongoose directly
    const [employees, total] = await Promise.all([
      EmployeeModel.find(dbFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      EmployeeModel.countDocuments(dbFilter),
    ]);
      // inside EmployeeService.listEmployees or controller (temporary)
console.log('listEmployees query:', query);

    return {
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) throw new AppError("Employee not found", 404);
    return employee;
  }

  async updateEmployee(id: string, data: Partial<IEmployee>) {
    const employee = await EmployeeRepository.update(id, data);
    if (!employee) throw new AppError("Employee not found", 404);
    return employee;
  }

  async deleteEmployee(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) throw new AppError("Employee not found", 404);

    const activeAssignment = await AssignmentRepository.findActiveByEmployee(id);
    if (activeAssignment) {
      throw new AppError("Cannot delete employee with assigned devices", 400);
    }

    return await EmployeeRepository.delete(id);
  }

  async verifyEmployee(token: string) {
    const employee = await EmployeeRepository.findByVerificationToken(token);
    if (!employee) throw new AppError("Invalid verification token", 400);

    if (!employee.verificationExpires || employee.verificationExpires < new Date()) {
      throw new AppError("Verification token expired", 400);
    }

    await EmployeeRepository.verifyEmployee(employee._id.toString());
    return true;
  }

  async resendVerification(email: string) {
    const employee = await EmployeeRepository.findByEmail(email);
    if (!employee) throw new AppError("Employee not found", 404);
    if (employee.isVerified) throw new AppError("Employee already verified", 400);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

    await EmployeeRepository.setVerificationToken(employee._id.toString(), token, expires);

    try {
      const verifyLink = `${process.env.FRONTEND_ORIGIN}/verify-employee?token=${token}`;
      const html = `
        <p>Hello ${employee.fullName},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyLink}">Verify Employee Email</a>
      `;

      await sendEmail(employee.email, "Verify your employee account", html);
    } catch (err) {
      logger.error("Resend employee verification email failed", err as Error);
    }

    return true;
  }
}

export default new EmployeeService();


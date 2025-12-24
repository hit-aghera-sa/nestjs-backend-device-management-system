import crypto from "crypto";
import EmployeeRepository from "./employee.repository";
import AppError from "../../core/errors/AppError";
import { sendEmail } from "../../core/utils/email.util";
import { logger } from "../../core/logger/logger";
import AssignmentRepository from "../assignment/assignment.repository";
import { Like } from "typeorm";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class EmployeeService {
  async createEmployee(data: any) {
    const existing = await EmployeeRepository.findByEmail(data.email);
    if (existing) throw new AppError("Email already exists", 400);

    const employee = await EmployeeRepository.create({
      fullName: data.fullName,
      email: data.email,
      department: data.department,
      designation: data.designation ?? null,
      contactNumber: data.contactNumber ?? null,
      isVerified: false,
      status: "ACTIVE",
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

    await EmployeeRepository.setVerificationToken(employee.id, token, expires);

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
    const baseWhere: any = {};

    if (query.status) baseWhere.status = query.status;

    if (query.isVerified === "true") baseWhere.isVerified = true;
    else if (query.isVerified === "false") baseWhere.isVerified = false;

    if (query.department) {
      baseWhere.department = Like(`%${query.department}%`);
    }

    let where: any = baseWhere;

    // ✅ STRICT $or PARITY WITH MONGOOSE
    if (query.search) {
      where = [
        {
          ...baseWhere,
          fullName: Like(`%${query.search}%`),
        },
        {
          ...baseWhere,
          email: Like(`%${query.search}%`),
        },
        {
          ...baseWhere,
          department: Like(`%${query.search}%`),
        },
        {
          ...baseWhere,
          designation: Like(`%${query.search}%`),
        },
      ];
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [employees, total] =
      await EmployeeRepository["repo"].findAndCount({
        where,
        skip,
        take: limit,
        order: { createdAt: "DESC" },
      });

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

  async updateEmployee(id: string, data: any) {
    const employee = await EmployeeRepository.update(id, data);
    if (!employee) throw new AppError("Employee not found", 404);
    return employee;
  }

  async deleteEmployee(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) throw new AppError("Employee not found", 404);

    const activeAssignment =
      await AssignmentRepository.findActiveByEmployee(id);

    if (activeAssignment) {
      throw new AppError(
        "Cannot delete employee with assigned devices",
        400
      );
    }

    return EmployeeRepository.delete(id);
  }

  async verifyEmployee(token: string) {
    const employee =
      await EmployeeRepository.findByVerificationToken(token);
    if (!employee) throw new AppError("Invalid verification token", 400);

    if (
      !employee.verificationExpires ||
      employee.verificationExpires < new Date()
    ) {
      throw new AppError("Verification token expired", 400);
    }

    await EmployeeRepository.verifyEmployee(employee.id);
    return true;
  }

  async resendVerification(email: string) {
    const employee = await EmployeeRepository.findByEmail(email);
    if (!employee) throw new AppError("Employee not found", 404);
    if (employee.isVerified)
      throw new AppError("Employee already verified", 400);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

    await EmployeeRepository.setVerificationToken(
      employee.id,
      token,
      expires
    );

    try {
      const verifyLink = `${process.env.FRONTEND_ORIGIN}/verify-employee?token=${token}`;
      const html = `
        <p>Hello ${employee.fullName},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyLink}">Verify Employee Email</a>
      `;
      await sendEmail(
        employee.email,
        "Verify your employee account",
        html
      );
    } catch (err) {
      logger.error(
        "Resend employee verification email failed",
        err as Error
      );
    }

    return true;
  }
}

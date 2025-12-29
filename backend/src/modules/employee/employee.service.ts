import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import crypto from 'crypto';

import { Employee, EmployeeStatus } from './employee.entity';
import AppError from '../../core/errors/AppError';
import { sendEmail } from '../../core/utils/email.util';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Assignment } from '../assignment/assignment.entity';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,

    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
  ) {}

  // ----------------------------------------------------
  // CREATE EMPLOYEE
  // ----------------------------------------------------
  async createEmployee(data: CreateEmployeeDto) {
    const existing = await this.repo.findOne({
      where: { email: data.email },
    });

    if (existing) throw new AppError('Email already exists', 400);

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

    const employee = this.repo.create({
      fullName: data.fullName,
      email: data.email,
      department: data.department,
      designation: data.designation ?? null,
      contactNumber: data.contactNumber ?? null,
      status: EmployeeStatus.ACTIVE,
      isVerified: false,
      verificationToken: token,
      verificationExpires: expires,
    });

    await this.repo.save(employee);

    const verifyLink = `${process.env.FRONTEND_ORIGIN}/verify-employee?token=${token}`;

    const html = `
      <p>Hello ${employee.fullName},</p>
      <p>Please verify your email:</p>
      <a href="${verifyLink}">Verify Employee Email</a>
    `;

    await sendEmail(employee.email, 'Verify your employee account', html);

    return employee;
  }

  // ----------------------------------------------------
  // LIST EMPLOYEES
  // ----------------------------------------------------
  async listEmployees(query: any = {}) {
    const baseWhere: any = {};

    if (query.status) baseWhere.status = query.status;

    if (query.isVerified === 'true') baseWhere.isVerified = true;
    else if (query.isVerified === 'false') baseWhere.isVerified = false;

    if (query.department) {
      baseWhere.department = Like(`%${query.department}%`);
    }

    let where: any = baseWhere;

    if (query.search) {
      where = [
        { ...baseWhere, fullName: Like(`%${query.search}%`) },
        { ...baseWhere, email: Like(`%${query.search}%`) },
        { ...baseWhere, department: Like(`%${query.search}%`) },
        { ...baseWhere, designation: Like(`%${query.search}%`) },
      ];
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [employees, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
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

  // ----------------------------------------------------
  // GET BY ID
  // ----------------------------------------------------
  async getEmployeeById(id: string) {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new AppError('Employee not found', 404);
    return employee;
  }

  // ----------------------------------------------------
  // UPDATE
  // ----------------------------------------------------
  async updateEmployee(id: string, data: UpdateEmployeeDto) {
    await this.repo.update(id, data);
    return this.getEmployeeById(id);
  }

  // ----------------------------------------------------
  // DELETE
  // ----------------------------------------------------
  async deleteEmployee(id: string) {
    const employee = await this.getEmployeeById(id);

    // 🔥 replaced deleted repo with TypeORM repo
    const activeAssignment = await this.assignmentRepo.findOne({
      where: {
        employee: { id },
        status: 'ASSIGNED',
      },
      relations: ['employee'],
    });

    if (activeAssignment) {
      throw new AppError(
        'Cannot delete employee with assigned devices',
        400,
      );
    }

    await this.repo.remove(employee);
    return true;
  }

  // ----------------------------------------------------
  // VERIFY
  // ----------------------------------------------------
  async verifyEmployee(token: string) {
    const employee = await this.repo.findOne({
      where: { verificationToken: token },
    });

    if (!employee) throw new AppError('Invalid verification token', 400);

    if (
      employee.verificationExpires &&
      employee.verificationExpires < new Date()
    ) {
      throw new AppError('Verification token expired', 400);
    }

    await this.repo.update(employee.id, {
      isVerified: true,
      verificationToken: null,
      verificationExpires: null,
    });

    return true;
  }

  // ----------------------------------------------------
  // RESEND VERIFICATION
  // ----------------------------------------------------
  async resendVerification(email: string) {
    const employee = await this.repo.findOne({ where: { email } });

    if (!employee) throw new AppError('Employee not found', 404);

    if (employee.isVerified)
      throw new AppError('Employee already verified', 400);

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

    await this.repo.update(employee.id, {
      verificationToken: token,
      verificationExpires: expires,
    });

    const verifyLink = `${process.env.FRONTEND_ORIGIN}/verify-employee?token=${token}`;

    const html = `
      <p>Hello ${employee.fullName},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyLink}">Verify Employee Email</a>
    `;

    await sendEmail(employee.email, 'Verify your employee account', html);

    return true;
  }
}

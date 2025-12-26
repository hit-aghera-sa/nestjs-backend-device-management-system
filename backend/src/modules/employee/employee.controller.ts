import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';

import { EmployeeService } from './employee.service';
import { successResponse } from '../../core/utils/response.util';
import AppError from '../../core/errors/AppError';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async createEmployee(@Body() body: CreateEmployeeDto) {
    const employee = await this.employeeService.createEmployee(body);

    return successResponse(
      {
        id: employee.id,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department,
        status: employee.status,
        isVerified: employee.isVerified,
      },
      'Employee created. Verification email sent.',
    );
  }

  @Get()
  async getEmployees(@Req() req: Request) {
    const result = await this.employeeService.listEmployees(req.query);
    return successResponse(result);
  }

  @Get('verify/:token')
  async verifyEmployee(@Param('token') token: string) {
    try {
      await this.employeeService.verifyEmployee(token);
      return successResponse(null, 'Employee verified');
    } catch (e) {
      if (e instanceof AppError) {
        throw new HttpException(e.message, e.statusCode || 400);
      }
      throw e;
    }
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: string) {
    const employee = await this.employeeService.getEmployeeById(id);
    return successResponse(employee);
  }

  @Patch(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() body: UpdateEmployeeDto,
  ) {
    const updated = await this.employeeService.updateEmployee(id, body);
    return successResponse(updated, 'Employee updated');
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    await this.employeeService.deleteEmployee(id);
    return successResponse(null, 'Employee deleted');
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.employeeService.resendVerification(dto.email);
    return successResponse(null, 'Verification email resent');
  }
}

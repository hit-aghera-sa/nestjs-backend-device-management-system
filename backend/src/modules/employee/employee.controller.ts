import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Res } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "./employee.service";
import { successResponse } from "../../core/utils/response.util";

@Controller("employees")
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await this.employeeService.createEmployee(req.body);
      return res.status(201).json(
        successResponse(
          {
            id: employee.id,
            fullName: employee.fullName,
            email: employee.email,
            department: employee.department,
            status: employee.status,
            isVerified: employee.isVerified,
          },
          "Employee created. Verification email sent."
        )
      );
    } catch (err) {
      next(err);
    }
  }

  @Get()
  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.employeeService.listEmployees(req.query);
      return res.status(200).json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  @Get(":id")
  async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await this.employeeService.getEmployeeById(req.params.id);
      return res.status(200).json(successResponse(employee));
    } catch (err) {
      next(err);
    }
  }

  @Patch(":id")
  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await this.employeeService.updateEmployee(
        req.params.id,
        req.body
      );
      return res.status(200).json(successResponse(updated, "Employee updated"));
    } catch (err) {
      next(err);
    }
  }

  @Delete(":id")
  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      await this.employeeService.deleteEmployee(req.params.id);
      return res.status(200).json(successResponse(null, "Employee deleted"));
    } catch (err) {
      next(err);
    }
  }

  @Get("verify/:token")
  async verifyEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      await this.employeeService.verifyEmployee(req.params.token);
      return res.status(200).json(successResponse(null, "Employee verified"));
    } catch (err) {
      next(err);
    }
  }

  @Post("resend-verification")
  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      await this.employeeService.resendVerification(req.body.email);
      return res
        .status(200)
        .json(successResponse(null, "Verification email resent"));
    } catch (err) {
      next(err);
    }
  }
}

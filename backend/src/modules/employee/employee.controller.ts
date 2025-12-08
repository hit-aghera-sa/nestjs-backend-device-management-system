import { Request, Response, NextFunction } from "express";
import EmployeeService from "./employee.service";
import { successResponse } from "../../core/utils/response.util";

class EmployeeController {
  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      return res.status(201).json(
        successResponse(
          {
            id: employee._id,
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

  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await EmployeeService.listEmployees(req.query);
      return res.status(200).json(successResponse(list));
    } catch (err) {
      next(err);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id);
      return res.status(200).json(successResponse(employee));
    } catch (err) {
      next(err);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await EmployeeService.updateEmployee(req.params.id, req.body);
      return res.status(200).json(successResponse(updated, "Employee updated"));
    } catch (err) {
      next(err);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      await EmployeeService.deleteEmployee(req.params.id);
      return res.status(200).json(successResponse(null, "Employee deleted"));
    } catch (err) {
      next(err);
    }
  }

  async verifyEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      await EmployeeService.verifyEmployee(token);
      return res.status(200).json(successResponse(null, "Employee verified"));
    } catch (err) {
      next(err);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await EmployeeService.resendVerification(email);
      return res.status(200).json(successResponse(null, "Verification email resent"));
    } catch (err) {
      next(err);
    }
  }
}

export default new EmployeeController();


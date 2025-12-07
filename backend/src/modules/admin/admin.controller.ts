import { Request, Response, NextFunction } from "express";
import AdminService from "./admin.service";
import { successResponse } from "../../core/utils/response.util";
import AppError from "../../core/errors/AppError";

class AdminController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await AdminService.register(req.body);
      // Do not return password or tokens
      const safe = { id: admin._id, fullName: admin.fullName, email: admin.email, isVerified: admin.isVerified };
      return res.status(201).json(successResponse(safe, "Registration successful. Check your email to verify."));
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.login(req.body);
      return res.status(200).json(successResponse({ token: result.token, admin: { id: result.admin._id, email: result.admin.email, fullName: result.admin.fullName } }, "Login successful"));
    } catch (err) {
      next(err);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      await AdminService.verifyEmail(token);
      return res.status(200).json(successResponse(null, "Email verified successfully"));
    } catch (err) {
      next(err);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AdminService.resendVerification(email);
      return res.status(200).json(successResponse(null, "Verification email resent"));
    } catch (err) {
      next(err);
    }
  }
}

export default new AdminController();


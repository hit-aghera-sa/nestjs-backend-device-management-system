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

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false,         // true only in production (HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json(successResponse({
      admin: {
        id: result.admin._id,
        email: result.admin.email,
        fullName: result.admin.fullName
      }
    }, "Login successful"));
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

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const adminId = req.user.id;
      const data = await AdminService.getCurrentAdmin(req.user.id);
      return res.status(200).json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const adminId = req.user.id;
      const data = await AdminService.updateProfile(req.user.id, req.body);
      return res.status(200).json(successResponse(data, "Profile updated"));
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!req.user) throw new AppError("Unauthorized", 401);
      const adminId = req.user.id;
      await AdminService.changePassword(adminId, oldPassword, newPassword);
      return res.status(200).json(successResponse(null, "Password changed"));
    } catch (err) {
      next(err);
    }
  }

  // Master admin management endpoints
  async getAllAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const admins = await AdminService.getAllAdmins();
      return res.status(200).json(successResponse(admins));
    } catch (err) {
      next(err);
    }
  }

  async getAdminById(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await AdminService.getAdminById(req.params.id);
      return res.status(200).json(successResponse(admin));
    } catch (err) {
      next(err);
    }
  }

  async updateAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await AdminService.updateAdmin(req.params.id, req.body);
      return res.status(200).json(successResponse(admin, "Admin updated"));
    } catch (err) {
      next(err);
    }
  }

  async deactivateAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedAdmin = await AdminService.deactivateAdmin(req.params.id);
      return res.status(200).json(successResponse(updatedAdmin, "Admin deactivated"));
    } catch (err) {
      next(err);
    }
  }

  async activateAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedAdmin = await AdminService.activateAdmin(req.params.id);
      return res.status(200).json(successResponse(updatedAdmin, "Admin activated"));
    } catch (err) {
      next(err);
    }
  }
  
  async logout(req: Request, res: Response) {
    res.clearCookie("token");
    return res.json({
      status: "success",
      message: "Logged out successfully"
    });
  }

}


export default new AdminController();

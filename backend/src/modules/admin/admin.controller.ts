import { AdminService } from "./admin.service";
import { successResponse } from "../../core/utils/response.util";
import AppError from "../../core/errors/AppError";
import { Controller, Post, Get, Patch, Param, Body, Req, Res, UseGuards, HttpException, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "../../core/guards/auth.guard";
import { LoginPayload } from "./auth.types";

@Controller("auth")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("register")
  async register(@Req() req: any, @Res() res: any) {
    try {
      const admin = await this.adminService.register(req.body);
      const safe = {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        isVerified: admin.isVerified,
      };
      return res
        .status(201)
        .json(
          successResponse(
            safe,
            "Registration successful. Check your email to verify."
          )
        );
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @Post("login")
  async login(@Body() credentials: LoginPayload, @Res() res: any) {
    try {
      const result = await this.adminService.login(credentials);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(
        successResponse(
          {
            admin: {
              id: result.admin.id,
              email: result.admin.email,
              fullName: result.admin.fullName,
            },
          },
          "Login successful"
        )
      );
    } catch (err) {
      console.error('Login error details:', err);
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      console.error('Non-AppError:', err);
      throw new HttpException(err instanceof Error ? err.message : "Internal server error", 500);
    }
  }

  @Get("verify/:token")
  async verify(@Param("token") token: string, @Res() res: any) {
    try {
      await this.adminService.verifyEmail(token);
      return res
        .status(200)
        .json(successResponse(null, "Email verified successfully"));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @Post("resend-verification")
  async resendVerification(@Body() body: { email: string }, @Res() res: any) {
    try {
      const { email } = body;
      await this.adminService.resendVerification(email);
      return res
        .status(200)
        .json(successResponse(null, "Verification email resent"));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async me(@Req() req: any, @Res() res: any) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const data = await this.adminService.getCurrentAdmin(req.user.id);
      return res.status(200).json(successResponse(data));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Patch("profile")
  async updateProfile(@Req() req: any, @Body() body: any, @Res() res: any) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const data = await this.adminService.updateProfile(req.user.id, body);
      return res
        .status(200)
        .json(successResponse(data, "Profile updated"));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Patch("change-password")
  async changePassword(@Req() req: any, @Body() body: { oldPassword: string; newPassword: string }, @Res() res: any) {
    try {
      const { oldPassword, newPassword } = body;
      if (!req.user) throw new AppError("Unauthorized", 401);
      await this.adminService.changePassword(
        req.user.id,
        oldPassword,
        newPassword
      );
      return res
        .status(200)
        .json(successResponse(null, "Password changed"));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllAdmins(@Res() res: any) {
    try {
      const admins = await this.adminService.getAllAdmins();
      return res.status(200).json(successResponse(admins));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  async getAdminById(@Param("id") id: string, @Res() res: any) {
    try {
      const admin = await this.adminService.getAdminById(id);
      return res.status(200).json(successResponse(admin));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  async updateAdmin(@Param("id") id: string, @Body() body: any, @Res() res: any) {
    try {
      const admin = await this.adminService.updateAdmin(
        id,
        body
      );
      return res
        .status(200)
        .json(successResponse(admin, "Admin updated"));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(":id/deactivate")
  async deactivateAdmin(@Param("id") id: string, @Res() res: any) {
    try {
      const updatedAdmin = await this.adminService.deactivateAdmin(
        id
      );
      return res
        .status(200)
        .json(successResponse(updatedAdmin, "Admin deactivated"));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(":id/activate")
  async activateAdmin(@Param("id") id: string, @Res() res: any) {
    try {
      const updatedAdmin = await this.adminService.activateAdmin(
        id
      );
      return res
        .status(200)
        .json(successResponse(updatedAdmin, "Admin activated"));
    } catch (err) {
      if (err instanceof AppError) {
        throw new HttpException(err.message, err.statusCode);
      }
      throw new HttpException("Internal server error", 500);
    }
  }

  @Post("logout")
  async logout(@Res() res: any) {
    res.clearCookie("token");
    return res.json({
      status: "success",
      message: "Logged out successfully",
    });
  }
}

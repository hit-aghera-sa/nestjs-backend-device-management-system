import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  HttpException,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { successResponse } from "../../core/utils/response.util";
import AppError from "../../core/errors/AppError";
import { AuthGuard } from "../../core/guards/auth.guard";

// ⭐ NEW — import DTOs
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";

@Controller("auth")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --------------------------------------------------
  // REGISTER
  // --------------------------------------------------
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res() res: any) {
    try {
      const admin = await this.adminService.register(dto);

      const safe = {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        isVerified: admin.isVerified,
      };

      return res
        .status(201)
        .json(successResponse(safe, "Registration successful. Check your email to verify."));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  // @Post("login")
  // async login(@Body() dto: LoginDto, @Res() res: any) {
  //   try {
  //     const result = await this.adminService.login(dto);

  //     res.cookie("token", result.token, {
  //       httpOnly: true,
  //       secure: false,
  //       sameSite: "lax",
  //       maxAge: 24 * 60 * 60 * 1000,
  //     });

  //     return res.status(200).json(
  //       successResponse(
  //         {
  //           admin: {
  //             id: result.admin.id,
  //             email: result.admin.email,
  //             fullName: result.admin.fullName,
  //             role: result.admin.role,
  //           },
  //         },
  //         "Login successful"
  //       )
  //     );
  //   } catch (err) {
  //     if (err instanceof AppError) {
  //       throw new HttpException(err.message, err.statusCode);
  //     }

  //     if (err instanceof HttpException) {
  //       throw err;
  //     }

  //     throw new HttpException('Internal server error', 500);
  //   }
  // }
// --------------------------------------------------
// LOGIN
// --------------------------------------------------
@Post("login")
async login(@Body() dto: LoginDto, @Res() res: any) {
  try {

    const result = await this.adminService.login(dto);

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
            role: result.admin.role,
          },
        },
        "Login successful"
      )
    );

  } catch (err) {

    // ⭐ DO NOT wrap AppError into 500
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ status: "error", message: err.message });
    }

    // ⭐ Only unexpected errors become 500
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

  // --------------------------------------------------
  // VERIFY EMAIL
  // --------------------------------------------------
  @Get("verify/:token")
  async verify(@Param("token") token: string, @Res() res: any) {
    try {
      await this.adminService.verifyEmail(token);
      return res
        .status(200)
        .json(successResponse(null, "Email verified successfully"));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // RESEND VERIFICATION
  // --------------------------------------------------
  @Post("resend-verification")
  async resendVerification(@Body() body: { email: string }, @Res() res: any) {
    try {
      await this.adminService.resendVerification(body.email);
      return res
        .status(200)
        .json(successResponse(null, "Verification email resent"));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // CURRENT USER
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Get("me")
  async me(@Req() req: any, @Res() res: any) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const data = await this.adminService.getCurrentAdmin(req.user.id);
      return res.status(200).json(successResponse(data));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // UPDATE PROFILE
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Patch("profile")
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
    @Res() res: any
  ) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const data = await this.adminService.updateProfile(req.user.id, dto);

      return res.status(200).json(successResponse(data, "Profile updated"));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // CHANGE PASSWORD
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Patch("change-password")
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
    @Res() res: any
  ) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      await this.adminService.changePassword(
        req.user.id,
        dto.oldPassword,
        dto.newPassword
      );

      return res.status(200).json(successResponse(null, "Password changed"));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // LIST ADMINS (with pagination)
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Get()
  async getAllAdmins(@Req() req: any, @Res() res: any) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const admins = await this.adminService.getAllAdmins(page, limit);

      return res.status(200).json(successResponse(admins));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // GET SINGLE ADMIN
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Get(":id")
  async getAdminById(@Param("id") id: string, @Res() res: any) {
    try {
      const admin = await this.adminService.getAdminById(id);
      return res.status(200).json(successResponse(admin));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // UPDATE ADMIN (MASTER ONLY)
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Patch(":id")
  async updateAdmin(
    @Param("id") id: string,
    @Body() dto: UpdateAdminDto,
    @Res() res: any
  ) {
    try {
      const admin = await this.adminService.updateAdmin(id, dto);
      return res
        .status(200)
        .json(successResponse(admin, "Admin updated"));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // DEACTIVATE ADMIN
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Patch(":id/deactivate")
  async deactivateAdmin(@Param("id") id: string, @Res() res: any) {
    try {
      const updatedAdmin = await this.adminService.deactivateAdmin(id);
      return res
        .status(200)
        .json(successResponse(updatedAdmin, "Admin deactivated"));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // ACTIVATE ADMIN
  // --------------------------------------------------
  @UseGuards(AuthGuard)
  @Patch(":id/activate")
  async activateAdmin(@Param("id") id: string, @Res() res: any) {
    try {
      const updatedAdmin = await this.adminService.activateAdmin(id);
      return res
        .status(200)
        .json(successResponse(updatedAdmin, "Admin activated"));
    } catch (err) {
      if (err instanceof AppError)
        throw new HttpException(err.message, err.statusCode);

      throw new HttpException("Internal server error", 500);
    }
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  @Post("logout")
  async logout(@Res() res: any) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.json({
      status: "success",
      message: "Logged out successfully",
    });
  }
}

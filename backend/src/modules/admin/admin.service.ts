import bcrypt from "bcrypt";
import { sign, Secret, SignOptions} from "jsonwebtoken";
import crypto from "crypto";
import AdminRepository from "./admin.repository";
import AdminModel from "./admin.model";
import AppError from "../../core/errors/AppError";
import { jwtConfig } from "../../config/jwt.config";
import { sendEmail } from "../../core/utils/email.util";
import { IAdmin } from "./admin.model";
import { logger } from "../../core/logger/logger";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class AdminService {
  async register(payload: { fullName: string; email: string; password: string }) {
    const existing = await AdminRepository.findByEmail(payload.email);
    if (existing) throw new AppError("Email already registered", 400);

    const hashed = await bcrypt.hash(payload.password, 10);
    const admin = await AdminRepository.create({
      fullName: payload.fullName,
      email: payload.email,
      password: hashed,
      role: "ADMIN",
      isVerified: false,
    } as Partial<IAdmin>);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
    const adminId = admin._id.toString();
    await AdminRepository.setVerificationToken(adminId, token, expires);

    try {
      const verifyLink = `${process.env.BACKEND_ORIGIN || "http://localhost:4000"}/api/auth/verify/${token}`;
      const html = `<p>Hello ${admin.fullName},</p>
        <p>Click below to verify your email (valid 24 hours):</p>
        <a href="${verifyLink}">Verify Email</a>`;
      await sendEmail(admin.email, "Verify your admin account", html);
    } catch (err) {
      logger.error("Failed to send verification email", err as Error);
    }

    return admin;
  }

  async login(payload: { email: string; password: string }) {
    const admin = await AdminRepository.findByEmail(payload.email);

    if (!admin) {
      throw new AppError("Admin does not exist", 404);
    }

    if (admin.isActive !== true) {
      throw new AppError("Admin does not exist", 404);
    }

    if (!admin.isVerified) {
      throw new AppError("Please verify your email before login", 401);
    }

    const matched = await bcrypt.compare(payload.password, admin.password);
    if (!matched) {
      throw new AppError("Invalid credentials", 401);
    }

    const adminId = admin._id.toString();
    const jwtSecret: Secret = jwtConfig.secret;

    const options: SignOptions = {
      expiresIn: jwtConfig.expiresIn as any,
    };

    const token = sign(
      { id: adminId, role: admin.role, email: admin.email },
      jwtSecret,
      options
    );

    return { admin, token };
  }


  async verifyEmail(token: string) {
    const record = await AdminRepository.findByVerificationToken(token);
    if (!record) throw new AppError("Invalid verification token", 400);
    if (!record.verificationExpires || record.verificationExpires < new Date()) {
      throw new AppError("Verification token expired", 400);
    }
    const recordId = record._id.toString();
    await AdminRepository.markVerified(recordId);
    return true;
  }

  async resendVerification(email: string) {
    const admin = await AdminRepository.findByEmail(email);
    if (!admin) throw new AppError("Admin not found", 404);
    if (admin.isVerified) throw new AppError("Account already verified", 400);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
    const adminId = admin._id.toString();
    await AdminRepository.setVerificationToken(adminId, token, expires);

    try {
      const verifyLink = `${process.env.FRONTEND_ORIGIN || "http://localhost:4200"}/verify-email?token=${token}`;
      const html = `<p>Hello ${admin.fullName},</p>
        <p>Click below to verify your email (valid 24 hours):</p>
        <a href="${verifyLink}">Verify Email</a>`;
      await sendEmail(admin.email, "Verify your admin account", html);
    } catch (err) {
      logger.error("Failed to send verification email", err as Error);
    }

    return true;
  }

  async getCurrentAdmin(id: string) {
    const admin = await AdminRepository.findById(id);
    if (!admin) throw new AppError("Admin not found", 404);
    return admin;
  }

  async updateProfile(id: string, data: { fullName?: string; email?: string }) {
    const updated = await AdminModel.findByIdAndUpdate(
      id, 
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) throw new AppError("Admin not found", 404);
    return updated;
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const admin = await AdminRepository.findById(id);
    if (!admin) throw new AppError("Admin not found", 404);

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) throw new AppError("Old password is incorrect", 400);

    const hashed = await bcrypt.hash(newPassword, 10);
    await AdminRepository.updatePassword(id, hashed);

    return true;
  }

  // Master admin management methods
  async getAllAdmins() {
    return AdminRepository.findAll();
  }

  async getAdminById(id: string) {
    const admin = await AdminRepository.findById(id);
    if (!admin) throw new AppError("Admin not found", 404);
    return admin;
  }

  async updateAdmin(id: string, data: any) {
    const updated = await AdminRepository.update(id, data);
    if (!updated) throw new AppError("Admin not found", 404);
    return updated;
  }

  async deactivateAdmin(id: string) {
    const admin = await AdminRepository.update(id, { isActive: false });
    if (!admin) throw new AppError("Admin not found", 404);
    return admin;
  }

  async activateAdmin(id: string) {
    const admin = await AdminRepository.update(id, { isActive: true });
    if (!admin) throw new AppError("Admin not found", 404);
    return admin;
  }
}

export default new AdminService();

import bcrypt from "bcrypt";
import { sign, Secret } from "jsonwebtoken";
import crypto from "crypto";
import AppError from "../../core/errors/AppError";
import { jwtConfig } from "../../config/jwt.config";
import { sendEmail } from "../../core/utils/email.util";
import { logger } from "../../core/logger/logger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Admin } from "./admin.entity";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  // ---------------------------------------------------------
  // REGISTER
  // ---------------------------------------------------------
  async register(dto: RegisterDto) {

    const email = dto.email.toLowerCase().trim();

    const existing = await this.adminRepo.findOne({
      where: { email }
    });

    if (existing) throw new AppError("Email already registered", 400);

    const hashed = await bcrypt.hash(dto.password, 10);

    const admin = this.adminRepo.create({
      fullName: dto.fullName.trim(),
      email,
      password: hashed,
      role: dto.role ?? "ADMIN",
      isVerified: false,
      isActive: true
    });

    await this.adminRepo.save(admin);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    await this.adminRepo.update(
      { id: admin.id },
      {
        verificationToken: token,
        verificationExpires: expires
      }
    );

    try {
      const verifyLink = `${
        process.env.BACKEND_ORIGIN || "http://localhost:4000"
      }/api/auth/verify/${token}`;

      await sendEmail(
        admin.email,
        "Verify your admin account",
        `<p>Hello ${admin.fullName},</p>
         <p>Click below to verify your email (valid 24 hours):</p>
         <a href="${verifyLink}">Verify Email</a>`
      );
    } catch (err) {
      logger.error("Failed to send verification email", err as Error);
    }

    return admin;
  }

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------
  async login(dto: LoginDto) {

    const email = dto.email.toLowerCase().trim();

    const admin = await this.adminRepo.findOne({
      where: { email }
    });

    if (!admin || !admin.isActive)
      throw new AppError("Admin does not exist", 404);

    if (!admin.isVerified)
      throw new AppError("Please verify your email before login", 401);

    const matched = await bcrypt.compare(dto.password, admin.password);
    if (!matched) throw new AppError("Invalid credentials", 401);

    const token = sign(
      { id: admin.id, role: admin.role, email: admin.email },
      jwtConfig.secret as Secret,
      { expiresIn: jwtConfig.expiresIn as any }
    );

    return { admin, token };
  }

  // ---------------------------------------------------------
  // VERIFY EMAIL
  // ---------------------------------------------------------
  async verifyEmail(token: string) {
    const admin = await this.adminRepo.findOne({
      where: { verificationToken: token }
    });

    if (!admin) throw new AppError("Invalid verification token", 400);

    if (!admin.verificationExpires || admin.verificationExpires < new Date())
      throw new AppError("Verification token expired", 400);

    await this.adminRepo.update(
      { id: admin.id },
      {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null
      }
    );

    return true;
  }

  // ---------------------------------------------------------
  // RESEND VERIFICATION
  // ---------------------------------------------------------
  async resendVerification(email: string) {

    email = email.toLowerCase().trim();

    const admin = await this.adminRepo.findOne({ where: { email } });

    if (!admin) throw new AppError("Admin not found", 404);
    if (admin.isVerified) throw new AppError("Account already verified", 400);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    await this.adminRepo.update(
      { id: admin.id },
      {
        verificationToken: token,
        verificationExpires: expires
      }
    );

    return true;
  }

  // ---------------------------------------------------------
  // CURRENT ADMIN
  // ---------------------------------------------------------
  async getCurrentAdmin(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new AppError("Admin not found", 404);
    return admin;
  }

  // ---------------------------------------------------------
  // PROFILE UPDATE
  // ---------------------------------------------------------
  async updateProfile(id: string, dto: UpdateProfileDto) {
    await this.adminRepo.update({ id }, dto);
    return this.getCurrentAdmin(id);
  }

  // ---------------------------------------------------------
  // CHANGE PASSWORD
  // ---------------------------------------------------------
  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new AppError("Admin not found", 404);

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) throw new AppError("Old password is incorrect", 400);

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.adminRepo.update({ id }, { password: hashed });

    return true;
  }

  // ---------------------------------------------------------
  // LIST ADMINS (PAGINATION)
  // ---------------------------------------------------------
  async getAllAdmins(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.adminRepo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: "DESC" }
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // ---------------------------------------------------------
  // GET ADMIN
  // ---------------------------------------------------------
  async getAdminById(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new AppError("Admin not found", 404);
    return admin;
  }

  // ---------------------------------------------------------
  // UPDATE ADMIN
  // ---------------------------------------------------------
  async updateAdmin(id: string, dto: UpdateAdminDto) {
    await this.adminRepo.update({ id }, dto);
    return this.getAdminById(id);
  }

  // ---------------------------------------------------------
  // DEACTIVATE
  // ---------------------------------------------------------
  async deactivateAdmin(id: string) {
    await this.adminRepo.update({ id }, { isActive: false });
    return this.getAdminById(id);
  }

  // ---------------------------------------------------------
  // ACTIVATE
  // ---------------------------------------------------------
  async activateAdmin(id: string) {
    await this.adminRepo.update({ id }, { isActive: true });
    return this.getAdminById(id);
  }
}

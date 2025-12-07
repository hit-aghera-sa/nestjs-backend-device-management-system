import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../src/config/db.config";
import AdminModel from "../src/modules/admin/admin.model";
import bcrypt from "bcrypt";
import { logger } from "../src/core/logger/logger";

async function seed() {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL || "admin@company.com";
  const password = process.env.SEED_ADMIN_PASS || "Admin@123";

  const existing = await AdminModel.findOne({ email }).exec();
  if (existing) {
    logger.info("Seed admin already exists");
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await AdminModel.create({ fullName: "Master Admin", email, password: hashed, role: "MASTER", isVerified: true });

  logger.info(`Seeded admin: ${email}`);
  process.exit(0);
}

seed().catch(err => {
  logger.error("Seed error", err as Error);
  process.exit(1);
});


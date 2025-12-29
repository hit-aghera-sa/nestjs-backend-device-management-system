import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";
import bcrypt from "bcrypt";
import { Admin } from "../src/modules/admin/admin.entity";
import { LoggingService } from "../src/core/logger/LoggingService";

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "device_inventory",
  synchronize: false,
  entities: [Admin],
});

async function seed() {
  await dataSource.initialize();

  const repo = dataSource.getRepository(Admin);

  const email = process.env.SEED_ADMIN_EMAIL || "admin@company.com";
  const password = process.env.SEED_ADMIN_PASS || "Admin@123";

  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    LoggingService.info("Seed admin already exists");
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = repo.create({
    fullName: "Master Admin",
    email,
    password: hashed,
    role: "MASTER",
    isVerified: true,
    isActive: true,
  });

  await repo.save(admin);

  LoggingService.info(`Seeded admin: ${email}`);
  process.exit(0);
}

seed().catch((err) => {
  LoggingService.error("Seed error", err);
  process.exit(1);
});

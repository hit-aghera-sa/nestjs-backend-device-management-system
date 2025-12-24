import { DataSource } from "typeorm";
import { Admin } from "../modules/admin/admin.entity";
import { Employee } from "../modules/employee/employee.entity";
import { Device } from "../modules/device/device.entity";
import { Assignment } from "../modules/assignment/assignment.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "device_inventory",
  synchronize: true,
  logging: false,
  entities: [Admin, Employee, Device, Assignment],
});

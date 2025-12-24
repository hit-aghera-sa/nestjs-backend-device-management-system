import { AppDataSource } from "../../config/typeorm.config";
import { Employee } from "../employee/employee.entity";
import { Device } from "../device/device.entity";
import { Assignment } from "../assignment/assignment.entity";

export class DashboardService {
  // ----------------------------------------
  // OVERVIEW METRICS
  // ----------------------------------------
  async getOverview() {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const deviceRepo = AppDataSource.getRepository(Device);

    const totalEmployees = await employeeRepo.count();
    const totalDevices = await deviceRepo.count();

    const assignedDevices = await deviceRepo.count({
      where: { status: "ASSIGNED" },
    });
    const availableDevices = await deviceRepo.count({
      where: { status: "AVAILABLE" },
    });
    const damagedDevices = await deviceRepo.count({
      where: { status: "DAMAGED" },
    });
    const maintenanceDevices = await deviceRepo.count({
      where: { status: "MAINTENANCE" },
    });

    return {
      employees: { total: totalEmployees },
      devices: {
        total: totalDevices,
        assigned: assignedDevices,
        available: availableDevices,
        damaged: damagedDevices,
        maintenance: maintenanceDevices,
      },
    };
  }

  // ----------------------------------------
  // RECENT ASSIGNMENTS (Last N)
  // ----------------------------------------
  async getRecentAssignments(limit = 10) {
    const assignmentRepo = AppDataSource.getRepository(Assignment);

    return assignmentRepo.find({
      relations: ["employee", "device"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  // ----------------------------------------
  // CATEGORY WISE STATS
  // ----------------------------------------
  async getCategoryStats() {
    const deviceRepo = AppDataSource.getRepository(Device);

    const raw = await deviceRepo
      .createQueryBuilder("device")
      .select("device.category", "category")
      .addSelect("COUNT(*)", "total")
      .addSelect(
        `SUM(CASE WHEN device.status = 'ASSIGNED' THEN 1 ELSE 0 END)`,
        "assigned"
      )
      .addSelect(
        `SUM(CASE WHEN device.status = 'AVAILABLE' THEN 1 ELSE 0 END)`,
        "available"
      )
      .addSelect(
        `SUM(CASE WHEN device.status = 'DAMAGED' THEN 1 ELSE 0 END)`,
        "damaged"
      )
      .addSelect(
        `SUM(CASE WHEN device.status = 'MAINTENANCE' THEN 1 ELSE 0 END)`,
        "maintenance"
      )
      .groupBy("device.category")
      .orderBy("device.category", "ASC")
      .getRawMany();

    return raw.map((r) => ({
      category: r.category,
      total: Number(r.total),
      assigned: Number(r.assigned),
      available: Number(r.available),
      damaged: Number(r.damaged),
      maintenance: Number(r.maintenance),
    }));
  }
}

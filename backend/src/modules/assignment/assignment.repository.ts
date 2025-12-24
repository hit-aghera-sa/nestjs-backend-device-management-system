import { AppDataSource } from "../../config/typeorm.config";
import { Assignment } from "./assignment.entity";
import { Employee } from "../employee/employee.entity";
import { Device } from "../device/device.entity";
import { FindOptionsWhere } from "typeorm";

class AssignmentRepository {
  private repo = AppDataSource.getRepository(Assignment);

  async create(data: {
    employee: Employee;
    device: Device;
    employeeName?: string | null;
    deviceName?: string | null;
    deviceCategory?: string | null;
    expectedReturnDate?: Date | null;
    notes?: string | null;
    assignedAt: Date;
  }) {
    const assignment = this.repo.create(data);
    return this.repo.save(assignment);
  }

  async findActiveByDevice(deviceId: string) {
    return this.repo.findOne({
      where: {
        device: { id: deviceId },
        status: "ASSIGNED",
      },
      relations: ["employee", "device"],
    });
  }

  async findActiveByEmployee(employeeId: string) {
    return this.repo.findOne({
      where: {
        employee: { id: employeeId },
        status: "ASSIGNED",
      },
      relations: ["employee", "device"],
    });
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["employee", "device"],
    });
  }

  async listAssignments(
    where: FindOptionsWhere<Assignment>,
    skip: number,
    take: number
  ) {
    return this.repo.findAndCount({
      where,
      skip,
      take,
      relations: ["employee", "device"],
      order: { createdAt: "DESC" },
    });
  }

  async markReturned(id: string, notes?: string) {
    await this.repo.update(
      { id },
      {
        status: "RETURNED",
        returnedAt: new Date(),
        notes: notes ?? null,
      }
    );
    return this.findById(id);
  }

  async delete(id: string) {
    const assignment = await this.findById(id);
    if (!assignment) return null;
    await this.repo.remove(assignment);
    return assignment;
  }

  async count(where: FindOptionsWhere<Assignment>) {
    return this.repo.count({ where });
  }
}

export default new AssignmentRepository();

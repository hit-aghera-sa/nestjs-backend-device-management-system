import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Employee } from "../employee/employee.entity";
import { Device } from "../device/device.entity";

export type AssignmentStatus = "ASSIGNED" | "RETURNED";

@Entity({ name: "assignments" })
export class Assignment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @ManyToOne(() => Device, { nullable: false })
  @JoinColumn({ name: "deviceId" })
  device!: Device;

  @Column({ type: "varchar", nullable: true })
  employeeName?: string | null;

  @Column({ type: "varchar", nullable: true })
  deviceName?: string | null;

  @Column({ type: "varchar", nullable: true })
  deviceCategory?: string | null;

  @Column({ type: "date", nullable: true })
  expectedReturnDate?: Date | null;

  @Column({ type: "timestamp" })
  assignedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  returnedAt?: Date | null;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({
    type: "enum",
    enum: ["ASSIGNED", "RETURNED"],
    default: "ASSIGNED",
  })
  status!: AssignmentStatus;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
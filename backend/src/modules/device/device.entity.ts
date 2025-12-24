import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export type DeviceStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "DAMAGED"
  | "MAINTENANCE";

@Entity({ name: "devices" })
export class Device {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  deviceName!: string;

  @Column({ type: "varchar", length: 255 })
  category!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  brand?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  modelNumber?: string | null;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  serialNumber!: string;

  @Column({ type: "date", nullable: true })
  purchaseDate?: Date | null;

  @Column({ type: "date", nullable: true })
  warrantyExpiry?: Date | null;

  @Column({ type: "numeric", nullable: true })
  purchasePrice?: number | null;

  @Column({ type: "date", nullable: true })
  expectedReturnDate?: Date | null;

  @Column({
    type: "enum",
    enum: ["AVAILABLE", "ASSIGNED", "DAMAGED", "MAINTENANCE"],
    default: "AVAILABLE",
  })
  status!: DeviceStatus;

  @Column({ type: "text", nullable: true })
  specifications?: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}

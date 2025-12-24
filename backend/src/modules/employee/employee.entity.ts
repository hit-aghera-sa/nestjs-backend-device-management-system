import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity({ name: "employees" })
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  department!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  designation?: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  contactNumber?: string | null;

  @Column({
    type: "enum",
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
  })
  status!: "ACTIVE" | "INACTIVE";

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;

  @Column({ type: "varchar", nullable: true })
  verificationToken?: string | null;

  @Column({ type: "timestamp", nullable: true })
  verificationExpires?: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}

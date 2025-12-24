import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity({ name: "admins" })
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({
    type: "enum",
    enum: ["ADMIN", "MASTER"],
    default: "ADMIN",
  })
  role!: "ADMIN" | "MASTER";

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", nullable: true })
  verificationToken?: string | null;

  @Column({ type: "timestamp", nullable: true })
  verificationExpires?: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}

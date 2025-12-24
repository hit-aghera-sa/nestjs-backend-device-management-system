import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "MASTER";
  isVerified: boolean;
  isActive: boolean;
  verificationToken?: string | null;
  verificationExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema<IAdmin>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MASTER"], default: "ADMIN" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String, default: null },
    verificationExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const AdminModel = mongoose.model<IAdmin>("Admin", AdminSchema);

export default AdminModel;
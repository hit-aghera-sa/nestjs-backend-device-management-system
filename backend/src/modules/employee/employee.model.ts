import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  fullName: string;
  email: string;
  department: string;
  designation?: string;
  contactNumber?: string;
  status: { 
    type: String, 
    enum: ["ACTIVE", "INACTIVE"], 
    default: "ACTIVE" 
  },
  isVerified: boolean;
  verificationToken?: string | null;
  verificationExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema<IEmployee>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, default: null },
    contactNumber: { type: String, default: null },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default EmployeeModel;


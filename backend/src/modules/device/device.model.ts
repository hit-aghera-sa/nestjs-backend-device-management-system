import mongoose, { Schema, Document } from "mongoose";

export type DeviceStatus = "AVAILABLE" | "ASSIGNED" | "DAMAGED" | "MAINTENANCE";

export interface IDevice extends Document {
  deviceName: string;
  category: string;
  brand?: string | null;
  modelNumber?: string | null;
  serialNumber: string;
  purchaseDate?: Date | null;
  warrantyExpiry?: Date | null;
  purchasePrice?: number | null;
  status: DeviceStatus;
  specifications?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, default: null },
    modelNumber: { type: String, default: null },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    purchaseDate: { type: Date, default: null },
    warrantyExpiry: { type: Date, default: null },
    purchasePrice: { type: Number, default: null },
    status: {
      type: String,
      enum: ["AVAILABLE", "ASSIGNED", "DAMAGED", "MAINTENANCE"],
      default: "AVAILABLE",
    },
    specifications: { type: String, default: null },
  },
  { timestamps: true }
);

export const DeviceModel = mongoose.model<IDevice>("Device", DeviceSchema);
export default DeviceModel;


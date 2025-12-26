import mongoose, { Schema, Document } from "mongoose";
// import { IEmployee } from "../employee/employee.model";
import { IDevice } from "../device/device.model";

export interface IAssignment extends Document {
  // employee: mongoose.Types.ObjectId | IEmployee;
  device: mongoose.Types.ObjectId | IDevice;

  employeeName?: string;
  deviceName?: string;
  deviceCategory?: string;
  expectedReturnDate?: Date | null;

  assignedAt: Date;
  returnedAt?: Date | null;
  notes?: string | null;
  status: "ASSIGNED" | "RETURNED";
  createdAt: Date;
  updatedAt: Date;
}


const AssignmentSchema = new Schema<IAssignment>(
  {
    // employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    device: { type: Schema.Types.ObjectId, ref: "Device", required: true },

    employeeName: { type: String },   
    deviceName: { type: String },     
    deviceCategory: { type: String }, 
    expectedReturnDate: { type: Date, default: null }, 

    assignedAt: { type: Date, required: true, default: Date.now },
    returnedAt: { type: Date, default: null },

    notes: { type: String, default: null },

    status: {
      type: String,
      enum: ["ASSIGNED", "RETURNED"],
      default: "ASSIGNED",
    },
  },
  { timestamps: true }
);


export const AssignmentModel = mongoose.model<IAssignment>("Assignment", AssignmentSchema);
export default AssignmentModel;

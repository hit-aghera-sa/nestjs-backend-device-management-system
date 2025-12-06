import mongoose from "mongoose";
import { logger } from "../core/logger/logger";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/device_inventory";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      // mongoose options
    } as mongoose.ConnectOptions);
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error("MongoDB connection error", err as Error);
    throw err;
  }
}


import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db.config";
import { logger } from "./core/logger/logger";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", err as Error);
    process.exit(1);
  }
}

start();


import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import { logger } from "../logger/logger";

export default function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err.message ?? "Unhandled error", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: "error", message: err.message });
  }

  // generic 500
  return res.status(500).json({ status: "error", message: "Internal Server Error" });
}


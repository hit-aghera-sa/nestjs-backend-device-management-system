import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import AppError from "../errors/AppError.js";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Narrow type safely
    if (exception instanceof AppError) {
      return response.status(exception.statusCode).json({
        status: "error",
        message: exception.message,
      });
    }

    // Nest HTTP exceptions (optional but useful)
    if (
      typeof exception === "object" &&
      exception !== null &&
      "getStatus" in exception &&
      typeof (exception as any).getStatus === "function"
    ) {
      const httpStatus = (exception as any).getStatus();
      const message =
        (exception as any).message || "Unexpected HTTP error occurred";

      return response.status(httpStatus).json({
        status: "error",
        message,
      });
    }

    // fallback for unknown errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

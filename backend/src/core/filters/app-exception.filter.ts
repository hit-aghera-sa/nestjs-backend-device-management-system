import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import AppError from "../errors/AppError";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log the actual error for debugging
    console.error('Unhandled exception:', exception);

    if (exception instanceof AppError) {
      return response.status(exception.statusCode).json({
        status: "error",
        message: exception.message,
      });
    }

    // fallback for unknown errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

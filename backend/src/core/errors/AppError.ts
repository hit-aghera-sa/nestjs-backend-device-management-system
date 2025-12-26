import { HttpException } from '@nestjs/common';

export default class AppError extends HttpException {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super({ status: 'error', message }, statusCode);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

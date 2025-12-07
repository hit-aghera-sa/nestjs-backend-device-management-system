import AppError from "./AppError";

export default class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: any) {
    super(message, 400);
    this.details = details;
  }

  details?: any;
}


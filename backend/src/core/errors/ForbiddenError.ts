import AppError from "./AppError";

export default class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}


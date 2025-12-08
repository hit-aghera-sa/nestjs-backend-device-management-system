import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

export default function roleMiddleware(requiredRole: "MASTER" | "ADMIN") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (user.role !== requiredRole) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }

    next();
  };
}

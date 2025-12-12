import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.config";
import AppError from "../errors/AppError";

export interface AuthUser {
  id: string;
  email: string;
  role: "MASTER" | "ADMIN";
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export default function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {

  // 1️⃣ Read token from cookies
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("Not authenticated", 401));
  }

  try {
    const payload = jwt.verify(token, jwtConfig.secret) as any;

    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email
    };

    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}

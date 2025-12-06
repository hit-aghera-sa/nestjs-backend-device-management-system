import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.config";
import AppError from "../errors/AppError";

export interface AuthRequest extends Request {
  auth?: { id: string; role?: string };
}

export default function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authorization header missing", 401));
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, jwtConfig.secret) as any;
    req.auth = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}


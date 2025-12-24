import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.config";
import AppError from "../errors/AppError";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    const token = req.cookies?.token;

    if (!token) {
      throw new AppError("Not authenticated", 401);
    }

    try {
      const payload = jwt.verify(token, jwtConfig.secret) as any;

      req.user = {
        id: payload.id,
        role: payload.role,
        email: payload.email,
      };

      return true;
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
  }
}

import { IAdmin } from "../modules/admin/admin.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "MASTER" | "ADMIN";
        email: string;
      };
    }
  }
}

export {};

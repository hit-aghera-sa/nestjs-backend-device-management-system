import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true  
};

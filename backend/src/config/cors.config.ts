import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};


import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./modules";
import { corsOptions } from "./config/cors.config";
import errorMiddleware from "./core/middleware/error.middleware";
import { logger } from "./core/logger/logger";

const app: Application = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use(express.json());

// mount API routes
app.use("/api", routes);

// health fallback
app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));

// global error handler (last middleware)
app.use(errorMiddleware);

export default app;


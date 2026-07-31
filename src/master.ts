import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import constants from "./common";
import wLogger from "./config/logger.config";
import pool from "./config/db.config";
import routes from "./routes";
import { initTable } from "./model/user.model";
import { initServiceTable } from "./model/service.model";
import { initTransformationGalleryTable } from "./model/transformation_gallery.model";
import { initLoggerExceptionTable } from "./model/logger.model";
import { initContactRequestTable } from "./model/contact_request.model";

const app: Application = express();
// const MASTER_PORT = process.env.MASTER_PORT || 6101;
const PORT = process.env.PORT || 3000;

function initServer() {
  try {
    pool.getConnection().then(async (connection) => {
      wLogger.info("[Master]: Database connection successful");
      connection.release();
      try {
        await initTable();
        await initServiceTable();
        await initTransformationGalleryTable();
        await initLoggerExceptionTable();
        await initContactRequestTable();
        wLogger.info("[Master]: Database tables initialized");
      } catch (tableErr: any) {
        wLogger.error("[Master]: Table initialization failed: " + tableErr.message);
      }
    }).catch((err) => {
      wLogger.error("[Master]: Database connection failed: " + err.message);
    });

    const server = app.listen(PORT, () => {
      wLogger.info(`Master started on port ${PORT}`);
    });

    server.on("error", (err: Error) => {
      wLogger.error("[Master]: Server error: " + err.message);
    });
  } catch (error) {
    wLogger.error("Error initializing master");
  }
}

const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const bearer = req.headers.authorization;
    if (bearer) return bearer.replace("Bearer ", "");
    return ipKeyGenerator(req as any);
  },
  message: {
    status: constants.TOO_MANY_REQ,
    message: "Too many requests, please try again later.",
  },
  handler: (req: Request, res: Response) => {
    wLogger.warn(
      `W_RATE_LIMIT: IP ${req.ip} exceeded rate limit on ${req.originalUrl}`,
    );
    res.status(constants.TOO_MANY_REQ).json({
      status: constants.TOO_MANY_REQ,
      message: "Too many requests, please try again later.",
    });
  },
});

app.use(express.json());
app.use(cors());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);
app.use(compression());
app.use(globalRateLimiter);

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0",
  });
});
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

app.use('/api', routes);

app.all(/.*/, (req: Request, res: Response) => {
  res.status(404).send("API Request Not Valid. Please check Again.");
});

void initServer();

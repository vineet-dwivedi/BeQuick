import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import companyRoutes from "./routes/companies.routes.js";
import jobRoutes from "./routes/jobs.routes.js";
import searchRoutes from "./routes/search.routes.js";
import sourceRoutes from "./routes/sources.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { notFound } from "./middlewares/notfound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const DEFAULT_ALLOWED_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);

const configuredAllowedOrigins = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const wildcardToRegExp = (value) =>
  new RegExp(
    `^${value
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*")}$`,
    "i"
  );

const exactAllowedOrigins = new Set(DEFAULT_ALLOWED_ORIGINS);
const wildcardAllowedOrigins = [];

configuredAllowedOrigins.forEach((origin) => {
  if (origin.includes("*")) {
    wildcardAllowedOrigins.push(wildcardToRegExp(origin));
    return;
  }

  exactAllowedOrigins.add(origin);
});

const allowAnyOrigin = configuredAllowedOrigins.length === 0;

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowAnyOrigin || exactAllowedOrigins.has(origin)) {
    return true;
  }

  return wildcardAllowedOrigins.some((pattern) => pattern.test(origin));
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
};

app.use(
  cors(corsOptions)
);

app.use(requestLogger);
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", companyRoutes);
app.use("/api", jobRoutes);
app.use("/api", searchRoutes);
app.use("/api", sourceRoutes);
app.use("/api", statsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running." });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 and error handlers (keep them last).
app.use(notFound);
app.use(errorHandler);

export default app;

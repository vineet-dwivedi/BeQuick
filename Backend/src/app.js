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

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
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

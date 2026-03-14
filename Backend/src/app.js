import express from "express";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/companies.routes.js";
import jobRoutes from "./routes/jobs.routes.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", companyRoutes);
app.use("/api", jobRoutes);
app.use("/api", searchRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running." });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;

import { Router } from "express";
import { runCrawlNow } from "../controllers/admin.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/admin/crawl", requireAuth, requireAdmin, runCrawlNow);

export default router;

import { Router } from "express";
import { getJobById, getJobs } from "../controllers/jobs.controller.js";

const router = Router();

router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobById);

export default router;

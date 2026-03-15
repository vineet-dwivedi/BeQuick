import { Router } from "express";
import { getJobById, getJobs } from "../controllers/jobs.controller.js";
import { validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { jobParamsSchema, jobsQuerySchema } from "../validators/jobs.schema.js";

const router = Router();

router.get("/jobs", validateQuery(jobsQuerySchema), getJobs);
router.get("/jobs/:id", validateParams(jobParamsSchema), getJobById);

export default router;

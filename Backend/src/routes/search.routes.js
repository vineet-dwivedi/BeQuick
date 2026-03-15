import { Router } from "express";
import { searchJobs } from "../controllers/serach.controller.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { searchQuerySchema, searchSchema } from "../validators/search.schema.js";

const router = Router();

router.post("/search", validateBody(searchSchema), searchJobs);
router.get("/search", validateQuery(searchQuerySchema), searchJobs);

export default router;

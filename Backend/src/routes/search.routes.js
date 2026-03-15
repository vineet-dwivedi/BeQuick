import { Router } from "express";
import { searchJobs } from "../controllers/serach.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { searchSchema } from "../validators/search.schema.js";

const router = Router();

router.post("/search", validateBody(searchSchema), searchJobs);

export default router;

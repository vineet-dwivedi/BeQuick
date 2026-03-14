import { Router } from "express";
import { searchJobs } from "../controllers/serach.controller.js";

const router = Router();

router.post("/search", searchJobs);

export default router;

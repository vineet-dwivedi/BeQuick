import { Router } from "express";
import { getCompanies, getCompanyById } from "../controllers/companies.controller.js";

const router = Router();

router.get("/companies", getCompanies);
router.get("/companies/:id", getCompanyById);

export default router;

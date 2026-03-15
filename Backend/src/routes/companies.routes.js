import { Router } from "express";
import { getCompanies, getCompanyById } from "../controllers/companies.controller.js";
import { validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { companiesQuerySchema, companyParamsSchema } from "../validators/companies.schema.js";

const router = Router();

router.get("/companies", validateQuery(companiesQuerySchema), getCompanies);
router.get("/companies/:id", validateParams(companyParamsSchema), getCompanyById);

export default router;

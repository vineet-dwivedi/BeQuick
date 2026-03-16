import { Router } from "express";
import {
  createSource,
  deleteSource,
  getSourceById,
  getSources,
  updateSource
} from "../controllers/sources.controller.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import {
  sourceCreateSchema,
  sourceParamsSchema,
  sourceQuerySchema,
  sourceUpdateSchema
} from "../validators/sources.schema.js";

const router = Router();

router.get("/sources", validateQuery(sourceQuerySchema), getSources);
router.get("/sources/:id", validateParams(sourceParamsSchema), getSourceById);
router.post("/sources", validateBody(sourceCreateSchema), createSource);
router.put(
  "/sources/:id",
  validateParams(sourceParamsSchema),
  validateBody(sourceUpdateSchema),
  updateSource
);
router.delete("/sources/:id", validateParams(sourceParamsSchema), deleteSource);

export default router;

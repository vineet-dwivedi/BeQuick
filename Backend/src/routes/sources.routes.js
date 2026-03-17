import { Router } from "express";
import {
  createSource,
  deleteSource,
  getSourceById,
  getSources,
  updateSource
} from "../controllers/sources.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import {
  sourceCreateSchema,
  sourceParamsSchema,
  sourceQuerySchema,
  sourceUpdateSchema
} from "../validators/sources.schema.js";

const router = Router();

router.get(
  "/sources",
  requireAuth,
  requireAdmin,
  validateQuery(sourceQuerySchema),
  getSources
);
router.get(
  "/sources/:id",
  requireAuth,
  requireAdmin,
  validateParams(sourceParamsSchema),
  getSourceById
);
router.post(
  "/sources",
  requireAuth,
  requireAdmin,
  validateBody(sourceCreateSchema),
  createSource
);
router.put(
  "/sources/:id",
  requireAuth,
  requireAdmin,
  validateParams(sourceParamsSchema),
  validateBody(sourceUpdateSchema),
  updateSource
);
router.delete(
  "/sources/:id",
  requireAuth,
  requireAdmin,
  validateParams(sourceParamsSchema),
  deleteSource
);

export default router;

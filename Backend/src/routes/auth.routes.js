import { Router } from "express";
import {
  googleLogin,
  logout,
  me
} from "../controllers/auth.contoller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { googleAuthSchema } from "../validators/auth.schema.js";

const router = Router();

router.post("/auth/google", validateBody(googleAuthSchema), googleLogin);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);

export default router;

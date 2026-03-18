import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
  resendVerificationEmail,
  verifyEmail
} from "../controllers/auth.contoller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema
} from "../validators/auth.schema.js";

const router = Router();

router.post("/auth/register", validateBody(registerSchema), register);
router.post("/auth/login", validateBody(loginSchema), login);
router.post(
  "/auth/resend-verification",
  validateBody(resendVerificationSchema),
  resendVerificationEmail
);
router.post("/auth/verify-email", validateBody(verifyEmailSchema), verifyEmail);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);

export default router;

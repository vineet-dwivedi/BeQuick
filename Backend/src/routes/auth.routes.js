import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
  requestOtp,
  verifyOtp
} from "../controllers/auth.contoller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
  requestOtpSchema,
  verifyOtpSchema
} from "../validators/auth.schema.js";

const router = Router();

router.post("/auth/register", validateBody(registerSchema), register);
router.post("/auth/login", validateBody(loginSchema), login);
router.post("/auth/request-otp", validateBody(requestOtpSchema), requestOtp);
router.post("/auth/verify-otp", validateBody(verifyOtpSchema), verifyOtp);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);

export default router;

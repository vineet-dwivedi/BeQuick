import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.contoller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);

export default router;

import { Router } from "express";
import { login, me } from "../controllers/authController";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.get("/me", requireAdmin, me);

export default router;

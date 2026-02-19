import { Router } from "express";
import {
  loginController,
  logoutController,
  getMyProfileController,
  refreshTokenController,
} from "./auth.controller";
import { authenticate, loginRateLimiter } from "../../middleware/auth";

const router = Router();

router.post("/login", loginRateLimiter, loginController);
router.post("/refresh", refreshTokenController);
router.post("/logout", authenticate, logoutController);
router.get("/me", authenticate, getMyProfileController);

export default router;

import { authenticate, authorize } from "../../../middleware/auth";
import { Router } from "express";
import {
  generateQRController,
  verifyQRController,
} from "./attendance.controller";

const router = Router();

router.get("/generate-qr", generateQRController);
router.post("/verify-qr", authenticate, verifyQRController);

export default router;

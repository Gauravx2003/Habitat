import { Router } from "express";
import { updatePushTokenController } from "./users.controller";
import { authenticate } from "../../../middleware/auth";

const router = Router();

router.patch("/push-token", authenticate, updatePushTokenController);

export default router;

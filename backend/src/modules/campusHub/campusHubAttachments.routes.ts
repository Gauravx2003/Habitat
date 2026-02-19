import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { addAttachments } from "./campusHubAttachments.controller";

const router = Router();

router.post(
  "/:eventId/attachments",
  authenticate,
  authorize(["ADMIN"]),
  upload.array("images", 5),
  addAttachments,
);

export default router;

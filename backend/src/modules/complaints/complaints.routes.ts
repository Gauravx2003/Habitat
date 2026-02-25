import Router from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  raiseComplaint,
  getMyComplaintsController,
  getEscalatedComplaintsController,
  getComplaintCategoriesController,
  reassignComplaintController,
  adminCloseComplaintController,
  residentRejectResolutionController,
  residentCloseComplaintController,
  getComplaintHistoryController,
  getThreadController,
  postMessageController,
} from "./complaints.controller";

const router = Router();

router.get("/categories", authenticate, getComplaintCategoriesController);

router.post("/", authenticate, authorize(["RESIDENT"]), raiseComplaint);
router.get(
  "/my",
  authenticate,
  authorize(["RESIDENT"]),
  getMyComplaintsController,
);

router.get(
  "/escalated",
  authenticate,
  authorize(["ADMIN"]),
  getEscalatedComplaintsController,
);

router.patch(
  "/reassign/:id",
  authenticate,
  authorize(["ADMIN"]),
  reassignComplaintController,
);

router.patch(
  "/:id/close",
  authenticate,
  authorize(["RESIDENT"]),
  residentCloseComplaintController,
);

// Resident rejects the work (Escalates to Admin)
router.patch(
  "/:id/reject",
  authenticate,
  authorize(["RESIDENT"]),
  residentRejectResolutionController,
);

// --- ADMIN WORKFLOW ---
// Admin forcefully closes a false or invalid escalation
router.patch(
  "/:id/admin-close",
  authenticate,
  authorize(["ADMIN"]),
  adminCloseComplaintController,
);

router.get("/:id/history", authenticate, getComplaintHistoryController);

// Add these to your existing complaint routes
router.get("/:complaintId/thread", authenticate, getThreadController);
router.post("/:complaintId/thread", authenticate, postMessageController);

export default router;

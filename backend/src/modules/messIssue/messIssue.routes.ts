import { Router } from "express";
import {
  createMessComplaintController,
  updateMessComplaintController,
  getAllMessIssuesController,
  getMyMessIssuesController,
  getMessIssueAnalyticsController,
} from "./messIssue.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get(
  "/analytics",
  authenticate,
  authorize(["ADMIN"]),
  getMessIssueAnalyticsController,
);

router.post(
  "/create",
  authenticate,
  authorize(["RESIDENT"]),
  createMessComplaintController,
);

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "RESIDENT", "STAFF"]),
  getAllMessIssuesController,
);

router.get(
  "/my",
  authenticate,
  authorize(["RESIDENT"]),
  getMyMessIssuesController,
);

router.patch(
  "/update/:id",
  authenticate,
  authorize(["ADMIN"]),
  updateMessComplaintController,
);

export default router;

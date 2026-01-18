import { Router } from "express";
import {
  createMessComplaintController,
  updateMessComplaintController,
  getAllMessIssuesController,
} from "./messIssue.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(["RESIDENT"]),
  createMessComplaintController
);

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "STAFF"]),
  getAllMessIssuesController
);

router.patch(
  "/update/:id",
  authenticate,
  authorize(["ADMIN"]),
  updateMessComplaintController
);

export default router;

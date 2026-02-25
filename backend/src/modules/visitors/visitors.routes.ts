import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  createRequestController,
  getMyVisitorRequestsController,
  getPendingRequestsController,
  getAllRequestsController,
  updateRequestController,
  getTodaysVisitorsController,
  verifyVisitorController,
} from "./visitors.controller";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(["RESIDENT"]),
  createRequestController,
);

router.get(
  "/my-requests",
  authenticate,
  authorize(["RESIDENT"]),
  getMyVisitorRequestsController,
);

router.get(
  "/pending",
  authenticate,
  authorize(["ADMIN"]),
  getPendingRequestsController,
);

router.get(
  "/all",
  authenticate,
  authorize(["ADMIN"]),
  getAllRequestsController,
);

router.patch(
  "/:id/update",
  authenticate,
  authorize(["ADMIN"]),
  updateRequestController,
);

router.get(
  "/today",
  authenticate,
  authorize(["ADMIN", "SECURITY"]),
  getTodaysVisitorsController,
);

router.post(
  "/verify",
  authenticate,
  authorize(["SECURITY"]),
  verifyVisitorController,
);

export default router;

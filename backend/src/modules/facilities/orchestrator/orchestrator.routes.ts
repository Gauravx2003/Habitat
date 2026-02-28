import { Router } from "express";
import { authenticate, authorize } from "../../../middleware/auth";
import {
  getResourcesController,
  getAvailableSlotsController,
  bookSlotController,
  joinWaitlistController,
  cancelSlotController,
  getMyQueueController,
  getOrchestratorStats,
  forceCancelBookingController,
  updateResourceStatusController,
  addResourceController,
  getAllActiveBookingsController,
  getAllWaitlistController,
  bypassQueueController,
  getHeatmapController,
  getWaitlistTurnaroundController,
  getFlakeRateController,
} from "./orchestrator.controller";

const orchestratorRouter = Router();

// Get the visual dashboard data
orchestratorRouter.get("/resources", authenticate, getResourcesController);
orchestratorRouter.get(
  "/resources/:resourceId/slots",
  authenticate,
  getAvailableSlotsController,
);
orchestratorRouter.get("/my-queue", authenticate, getMyQueueController);

// Actions
orchestratorRouter.post("/book", authenticate, bookSlotController);
orchestratorRouter.post("/waitlist", authenticate, joinWaitlistController);
orchestratorRouter.post(
  "/cancel/:bookingId",
  authenticate,
  cancelSlotController,
);

// ─── ADMIN ROUTES ───

orchestratorRouter.post(
  "/orchestrator/resource",
  authenticate,
  authorize(["ADMIN"]),
  addResourceController,
);
orchestratorRouter.patch(
  "/orchestrator/resource/:resourceId",
  authenticate,
  authorize(["ADMIN"]),
  updateResourceStatusController,
);

orchestratorRouter.post(
  "/orchestrator/force-cancel/:bookingId",
  authenticate,
  authorize(["ADMIN"]),
  forceCancelBookingController,
);

orchestratorRouter.get(
  "/orchestrator/active-bookings",
  authenticate,
  authorize(["ADMIN"]),
  getAllActiveBookingsController,
);

orchestratorRouter.get(
  "/orchestrator/waitlist",
  authenticate,
  authorize(["ADMIN"]),
  getAllWaitlistController,
);

orchestratorRouter.post(
  "/orchestrator/bypass-queue",
  authenticate,
  authorize(["ADMIN"]),
  bypassQueueController,
);

orchestratorRouter.get(
  "/orchestrator/stats",
  authenticate,
  authorize(["ADMIN"]),
  getOrchestratorStats,
);

orchestratorRouter.get(
  "/orchestrator/analytics/heatmap",
  authenticate,
  authorize(["ADMIN"]),
  getHeatmapController,
);

orchestratorRouter.get(
  "/orchestrator/analytics/waitlist-turnaround",
  authenticate,
  authorize(["ADMIN"]),
  getWaitlistTurnaroundController,
);

orchestratorRouter.get(
  "/orchestrator/analytics/flake-rate",
  authenticate,
  authorize(["ADMIN"]),
  getFlakeRateController,
);

export default orchestratorRouter;

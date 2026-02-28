import { Router } from "express";
import {
  createEventController,
  createNoticeController,
  getHubDataController,
  updateEventController,
  deleteEventController,
  updateNoticeController,
  deleteNoticeController,
} from "./campusHub.controller";
import { authenticate, authorize } from "../../../middleware/auth";

const campusHubRouter = Router();

// Resident: Fetch everything for the "Campus Hub" screen
campusHubRouter.get(
  "/data",
  authenticate,
  authorize(["RESIDENT", "ADMIN", "STAFF"]),
  getHubDataController,
);

// Admin: Upload Event
campusHubRouter.post(
  "/event",
  authenticate,
  authorize(["ADMIN"]),
  createEventController,
);

// Admin: Upload Notice OR Schedule Item
// Body: { title, description, type: "SCHEDULE" | "ANNOUNCEMENT", scheduledFor? }
campusHubRouter.post(
  "/notice",
  authenticate,
  authorize(["ADMIN"]),
  createNoticeController,
);

// Admin: Update Event
campusHubRouter.patch(
  "/event/:id",
  authenticate,
  authorize(["ADMIN"]),
  updateEventController,
);

// Admin: Delete Event
campusHubRouter.delete(
  "/event/:id",
  authenticate,
  authorize(["ADMIN"]),
  deleteEventController,
);

// Admin: Update Notice
campusHubRouter.patch(
  "/notice/:id",
  authenticate,
  authorize(["ADMIN"]),
  updateNoticeController,
);

// Admin: Delete Notice
campusHubRouter.delete(
  "/notice/:id",
  authenticate,
  authorize(["ADMIN"]),
  deleteNoticeController,
);

export default campusHubRouter;

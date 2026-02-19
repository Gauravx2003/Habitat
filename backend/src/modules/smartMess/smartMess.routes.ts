import { Router } from "express";
import {
  getMenuController,
  createMenuController,
  optInController,
  optOutController,
  scanMessController,
} from "./smartMess.controller";
import { authenticate, authorize } from "../../middleware/auth";

const messRouter = Router();

// Student Routes
messRouter.get("/menu", authenticate, getMenuController);
messRouter.post(
  "/opt-in",
  authenticate,
  authorize(["RESIDENT"]),
  optInController,
);

messRouter.post(
  "/opt-out",
  authenticate,
  authorize(["RESIDENT"]),
  optOutController,
);

// Admin / Staff Routes
messRouter.post(
  "/create",
  authenticate,
  authorize(["ADMIN", "STAFF"]), // Allows Wardens to set menu
  createMenuController,
);

messRouter.post(
  "/scan",
  authenticate,
  authorize(["STAFF", "ADMIN"]),
  scanMessController,
);

export default messRouter;

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

// Admin / Staff / Security Routes
messRouter.post(
  "/create",
  authenticate,
  authorize(["ADMIN", "STAFF", "SECURITY"]), // Allows Guards & Wardens to set menu
  createMenuController,
);

messRouter.post(
  "/scan",
  authenticate,
  authorize(["STAFF", "ADMIN", "SECURITY"]),
  scanMessController,
);

export default messRouter;

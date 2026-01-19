import Router from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  createResidentController,
  getHostelBlocksController,
  getBlockRoomsController,
} from "./residentCreation.controller";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(["ADMIN"]),
  createResidentController
);

router.get(
  "/hostelBlocks/:hostelId",
  authenticate,
  authorize(["ADMIN"]),
  getHostelBlocksController
);

router.get(
  "/blockRooms/:blockId",
  authenticate,
  authorize(["ADMIN"]),
  getBlockRoomsController
);

export default router;

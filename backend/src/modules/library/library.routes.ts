import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  borrowBookController,
  downloadBookController,
  getBooksController,
  returnBookController,
  getMyBooksController,
  reserveBookController,
  handoverBookController,
} from "./library.controller";

const router = Router();

router.get("/", authenticate, getBooksController);
router.get("/my", authenticate, getMyBooksController);
// router.get("/:id", authenticate, getBookById); // Optional

router.post("/reserve", authenticate, reserveBookController);
router.post(
  "/handover",
  authenticate,
  authorize(["ADMIN", "STAFF"]),
  handoverBookController,
);
router.get("/:bookId/download", authenticate, downloadBookController);
router.post("/borrow", authenticate, borrowBookController);
router.post("/return", authenticate, returnBookController);

export default router;

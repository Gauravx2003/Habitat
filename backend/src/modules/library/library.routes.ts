import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  borrowBookController,
  downloadBookController,
  getBooksController,
  returnBookController,
  getMyBooksController,
} from "./library.controller";

const router = Router();

router.get("/", authenticate, getBooksController);
router.get("/my", authenticate, getMyBooksController);
// router.get("/:id", authenticate, getBookById); // Optional
router.get("/:bookId/download", authenticate, downloadBookController);
router.post("/borrow", authenticate, borrowBookController);
router.post("/return", authenticate, returnBookController);

export default router;

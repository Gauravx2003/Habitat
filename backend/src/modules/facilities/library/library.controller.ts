import { Authenticate } from "../../../middleware/auth";
import { Response } from "express";
import {
  borrowBook,
  checkDigitalAccess,
  getAllBooks,
  returnBook,
  getMyBooks,
  reserveBook,
  getBookById,
  getMyBookById,
  handoverBook,
} from "./library.service";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getBooksController = async (req: Authenticate, res: Response) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.userId));
    if (!user || !user.hostelId) {
      return res.status(400).json({ message: "User not assigned to a hostel" });
    }
    const books = await getAllBooks(user.hostelId);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyBooksController = async (
  req: Authenticate,
  res: Response,
) => {
  const status = req.query.status as
    | "BORROWED"
    | "RETURNED"
    | "OVERDUE"
    | "ALL";

  try {
    const books = await getMyBooks(req.user!.userId, status);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const downloadBookController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { bookId } = req.params;
    const url = await checkDigitalAccess(req.user!.userId, bookId);
    res.status(200).json({ downloadUrl: url });
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};

export const reserveBookController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { bookId } = req.body;

    const book = await getMyBookById(bookId, req.user!.userId);
    if (book) {
      return res
        .status(400)
        .json({ message: "You have already borrowed this book" });
    }

    const result = await reserveBook(req.user!.userId, bookId);
    res.status(201).json({
      message: "Book reserved successfully! Please collect it within 24 hours.",
      ticket: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const handoverBookController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { reservationId } = req.body; // Scanned from Student's QR code
    const result = await handoverBook(reservationId);
    res
      .status(200)
      .json({ message: "Book handed over successfully.", transaction: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const borrowBookController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { bookId } = req.body;
    const result = await borrowBook(req.user!.userId, bookId);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const returnBookController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { transactionId } = req.body;
    const result = await returnBook(transactionId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

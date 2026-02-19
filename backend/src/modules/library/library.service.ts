import { db } from "../../db";
import {
  libraryBooks,
  libraryMemberships,
  libraryTransactions,
  libraryPlans,
  payments,
  users,
} from "../../db/schema";
import { eq, and, gt, desc, sql, getTableColumns } from "drizzle-orm";
import { createPayment } from "../finesAndPayments/finesAndPayments.service";

// --- Book Listing ---

export const getAllBooks = async (hostelId: string) => {
  return await db
    .select()
    .from(libraryBooks)
    .where(eq(libraryBooks.hostelId, hostelId));
};

export const getMyBooks = async (
  userId: string,
  status: "BORROWED" | "RETURNED" | "OVERDUE" | "ALL",
) => {
  let query = db
    .select({
      ...getTableColumns(libraryBooks),
      issueDate: libraryTransactions.issueDate,
      dueDate: libraryTransactions.dueDate,
      returnDate: libraryTransactions.returnDate,
      fineAmount: libraryTransactions.fineAmount,
      isFinePaid: libraryTransactions.isFinePaid,
      transactionStatus: libraryTransactions.status,
    })
    .from(libraryTransactions)
    .innerJoin(libraryBooks, eq(libraryTransactions.bookId, libraryBooks.id));

  const conditions: any[] = [eq(libraryTransactions.userId, userId)];

  if (status === "OVERDUE" || status === "BORROWED" || status === "RETURNED") {
    conditions.push(eq(libraryTransactions.status, status));
  }

  return await query.where(and(...conditions));
};

export const getBookById = async (bookId: string) => {
  const [book] = await db
    .select()
    .from(libraryBooks)
    .where(eq(libraryBooks.id, bookId));
  return book;
};

// --- Digital Access ---

export const checkDigitalAccess = async (userId: string, bookId: string) => {
  const [book] = await db
    .select()
    .from(libraryBooks)
    .where(eq(libraryBooks.id, bookId));

  if (!book || !book.isDigital) {
    throw new Error("Book not found or is not digital");
  }

  // Check for ACTIVE membership
  // Must be ACTIVE and endDate > now
  const [membership] = await db
    .select()
    .from(libraryMemberships)
    .where(
      and(
        eq(libraryMemberships.userId, userId),
        eq(libraryMemberships.status, "ACTIVE"),
        gt(libraryMemberships.endDate, new Date()),
      ),
    )
    .orderBy(desc(libraryMemberships.endDate)) // Get latest if multiple
    .limit(1);

  if (!membership) {
    throw new Error("Active Library Membership required for digital access");
  }

  return book.downloadUrl;
};

// --- Borrowing & Returning ---

export const borrowBook = async (userId: string, bookId: string) => {
  return await db.transaction(async (tx) => {
    // 1. Check Membership
    const [membership] = await tx
      .select()
      .from(libraryMemberships)
      .where(
        and(
          eq(libraryMemberships.userId, userId),
          eq(libraryMemberships.status, "ACTIVE"),
          gt(libraryMemberships.endDate, new Date()),
        ),
      )
      .limit(1);

    if (!membership) throw new Error("Active Library Membership required");

    // 2. Check Plan Limits
    const [plan] = await tx
      .select()
      .from(libraryPlans)
      .where(eq(libraryPlans.id, membership.planId));

    const activeTransactions = await tx
      .select() // Pro-tip: You can use { count: sql`count(*)` } for performance
      .from(libraryTransactions)
      .where(
        and(
          eq(libraryTransactions.userId, userId),
          eq(libraryTransactions.status, "BORROWED"),
        ),
      );

    if (
      plan?.maxBooksAllowed &&
      activeTransactions.length >= plan.maxBooksAllowed
    ) {
      throw new Error(`Limit reached. Max books: ${plan.maxBooksAllowed}`);
    }

    // 3. CRITICAL: Check Book Availability & Lock Row
    const [book] = await tx
      .select()
      .from(libraryBooks)
      .where(eq(libraryBooks.id, bookId)); // In raw SQL we would add "FOR UPDATE"

    if (!book || book.availableCopies < 1) {
      throw new Error("Book is currently unavailable");
    }

    // 4. Create Transaction & Update Inventory
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 14); // Default 14 days

    await tx
      .update(libraryBooks)
      .set({ availableCopies: sql`${libraryBooks.availableCopies} - 1` })
      .where(eq(libraryBooks.id, bookId));

    const [transaction] = await tx
      .insert(libraryTransactions)
      .values({
        userId,
        bookId,
        issueDate,
        dueDate,
        status: "BORROWED", // Ensure this matches your transactionStatusEnum
      })
      .returning();

    return transaction;
  });
};

export const returnBook = async (transactionId: string) => {
  return await db.transaction(async (tx) => {
    const [transaction] = await tx
      .select()
      .from(libraryTransactions)
      .where(eq(libraryTransactions.id, transactionId));

    if (!transaction || transaction.status !== "BORROWED") {
      throw new Error("Invalid transaction or book already returned");
    }

    const returnDate = new Date();
    let fineAmount = 0;
    let diffDays = 0;

    // 1. Calculate Fine
    if (returnDate > transaction.dueDate) {
      const diffTime = Math.abs(
        returnDate.getTime() - transaction.dueDate.getTime(),
      );
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Try to find the membership that WAS active or is CURRENTLY active
      // Logic: Just get the user's latest plan, even if expired, to determine rates
      const [membership] = await tx
        .select()
        .from(libraryMemberships)
        .where(eq(libraryMemberships.userId, transaction.userId))
        .orderBy(desc(libraryMemberships.endDate))
        .limit(1);

      let finePerDay = 10; // Default fallback fine

      if (membership) {
        const [plan] = await tx
          .select()
          .from(libraryPlans)
          .where(eq(libraryPlans.id, membership.planId));

        if (plan?.finePerDay) {
          finePerDay = plan.finePerDay;
        }
      }

      fineAmount = diffDays * finePerDay;
    }

    // 2. Update Transaction
    await tx
      .update(libraryTransactions)
      .set({
        returnDate,
        status: "RETURNED", // Ensure Schema has this value!
        fineAmount,
      })
      .where(eq(libraryTransactions.id, transactionId));

    // 3. Update Inventory (Increase copies)
    await tx
      .update(libraryBooks)
      .set({ availableCopies: sql`${libraryBooks.availableCopies} + 1` })
      .where(eq(libraryBooks.id, transaction.bookId));

    // 4. Create Fine Payment
    if (fineAmount > 0) {
      await createPayment(
        transaction.userId,
        fineAmount,
        "LIBRARY_FINE", // Changed from "LIBRARY_FINE" to match generic Payment Category enum if needed
        `Library Fine: ${diffDays} days late (Tx: ${transactionId.slice(0, 8)})`,
        undefined,
      );
    }

    return { message: "Book returned successfully", fineAmount };
  });
};

import cron from "node-cron";
import { db } from "../db";
import { libraryTransactions, users, notifications } from "../db/schema";
import { eq, and, lt } from "drizzle-orm";

// Run every day at Midnight (00:00)
export const startLibraryCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("🔄 Running Library Overdue Check...");

    try {
      const now = new Date();

      // 1. Find all transactions that are 'BORROWED' but past their Due Date
      const overdueTransactions = await db
        .select()
        .from(libraryTransactions)
        .where(
          and(
            eq(libraryTransactions.status, "BORROWED"),
            lt(libraryTransactions.dueDate, now), // Due Date is less than (before) Now
          ),
        );

      if (overdueTransactions.length === 0) {
        console.log("✅ No new overdue books found.");
        return;
      }

      console.log(`⚠️ Found ${overdueTransactions.length} overdue books.`);

      // 2. Process each overdue transaction
      for (const tx of overdueTransactions) {
        // A. Update Status to OVERDUE
        await db
          .update(libraryTransactions)
          .set({ status: "OVERDUE" })
          .where(eq(libraryTransactions.id, tx.id));

        // B. Send Notification to Student
        // await db.insert(notifications).values({
        //   userId: tx.userId,
        //   title: "Book Overdue Alert",
        //   message:
        //     "You have a book that is past its due date. Fines are now accumulating.",
        //   type: "WARNING",
        // });

        // C. Optional: Send Email/SMS here
      }
    } catch (error) {
      console.error("❌ Library Cron Failed:", error);
    }
  });
};

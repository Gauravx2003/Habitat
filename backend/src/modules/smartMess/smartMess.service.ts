import { db } from "../../db";
import { messMenu, messAttendance } from "../../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// 1. Fetch Menu for the Day
// 1. Fetch Menu for the Day with Opt-In Status
export const getDailyMenu = async (
  hostelId: string,
  date: Date,
  userId?: string,
) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Get Menu Items
  const menuItems = await db
    .select()
    .from(messMenu)
    .where(
      and(
        eq(messMenu.hostelId, hostelId),
        gte(messMenu.date, startOfDay),
        lte(messMenu.date, endOfDay),
      ),
    );

  if (!userId) return menuItems;

  // 2. Get User Attendance for the day
  const attendance = await db
    .select()
    .from(messAttendance)
    .where(
      and(
        eq(messAttendance.userId, userId),
        gte(messAttendance.date, startOfDay),
        lte(messAttendance.date, endOfDay),
      ),
    );

  // 3. Merge
  return menuItems.map((item) => {
    const record = attendance.find((a) => a.mealType === item.mealType);
    return {
      ...item,
      status: record?.status || null,
      qrToken: record?.qrToken || null,
    };
  });
};

// 2. Create Menu (Admin Side)
export const createDailyMenu = async (data: typeof messMenu.$inferInsert) => {
  const [menu] = await db.insert(messMenu).values(data).returning();
  return menu;
};

// 3. Opt-In Logic (Student)
export const optInForMeal = async (userId: string, menuId: string) => {
  // A. Get the Menu details first to know what we are booking
  const menuEntry = await db.query.messMenu.findFirst({
    where: eq(messMenu.id, menuId),
  });

  if (!menuEntry) throw new Error("Menu item not found");

  // B. Check for existing booking using the Menu's date and mealType
  const startOfDay = new Date(menuEntry.date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(menuEntry.date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await db.query.messAttendance.findFirst({
    where: and(
      eq(messAttendance.userId, userId),
      eq(messAttendance.mealType, menuEntry.mealType),
      gte(messAttendance.date, startOfDay),
      lte(messAttendance.date, endOfDay),
    ),
  });

  if (existing) throw new Error("Already opted in for this meal");

  // C. Generate Token & Save
  const token = `MESS:${uuidv4()}`;

  const [entry] = await db
    .insert(messAttendance)
    .values({
      userId,
      date: menuEntry.date, // Use the date from the menu
      mealType: menuEntry.mealType,
      qrToken: token,
      status: "OPTED_IN",
    })
    .returning();

  return entry;
};

// 4. Scan Logic (Mess Worker)
export const scanMessQr = async (qrToken: string) => {
  const entry = await db.query.messAttendance.findFirst({
    where: eq(messAttendance.qrToken, qrToken),
  });

  if (!entry) throw new Error("Invalid Mess Token");

  if (entry.status === "SCANNED") {
    throw new Error("Meal already claimed! ❌");
  }

  await db
    .update(messAttendance)
    .set({
      status: "SCANNED",
      scannedAt: new Date(),
    })
    .where(eq(messAttendance.id, entry.id));

  return { message: "Meal Served Successfully ✅", meal: entry.mealType };
};

// 5. Opt-Out Logic (Student)
export const optOutForMeal = async (userId: string, menuId: string) => {
  // A. Get Menu details to check cutoff and identify the meal
  const menuEntry = await db.query.messMenu.findFirst({
    where: eq(messMenu.id, menuId),
  });

  if (!menuEntry) throw new Error("Menu item not found");

  // B. Check Cutoff Time
  if (new Date() > menuEntry.cutoffTime) {
    throw new Error(
      `Cancellation closed! Deadline was ${menuEntry.cutoffTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    );
  }

  // C. Find and Delete Attendance Record
  // We need to match by User + Date + MealType (since menuId isn't directly in attendance table)
  const startOfDay = new Date(menuEntry.date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(menuEntry.date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db
    .delete(messAttendance)
    .where(
      and(
        eq(messAttendance.userId, userId),
        eq(messAttendance.mealType, menuEntry.mealType),
        gte(messAttendance.date, startOfDay),
        lte(messAttendance.date, endOfDay),
      ),
    )
    .returning();

  if (result.length === 0) {
    throw new Error("No active booking found to cancel.");
  }

  return { message: "Booking cancelled successfully" };
};

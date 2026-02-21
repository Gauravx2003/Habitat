import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";

import {
  complaints,
  complaintStatusHistory,
  hostels,
  messMenu,
} from "./schema";
import { v4 as uuidv4 } from "uuid";

import { eq } from "drizzle-orm";

const RULES = {
  BREAKFAST: {
    time: "08:00",
    cutoffHours: 12,
    items: ["Poha", "Tea/Coffee", "Oats", "Banana"],
  },
  LUNCH: {
    time: "13:00",
    cutoffHours: 3,
    items: ["Paneer Butter Masala", "Dal Tadka", "Rice", "Chapati", "Salad"],
  },
  SNACKS: {
    time: "17:00",
    cutoffHours: 1,
    items: ["Samosa", "Tea", "Biscuits"],
  },
  DINNER: {
    time: "20:00",
    cutoffHours: 4,
    items: ["Mix Veg", "Dal Fry", "Jeera Rice", "Roti", "Gulab Jamun"],
  },
};

async function seed() {
  console.log("🌱 Seeding database...");

  const [complaint] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.title, "Fan Broke"));

  const now = new Date();
  if (!complaint.assignedStaff) {
    throw new Error(
      "Cannot update status: No staff is assigned to this complaint.",
    );
  }

  await db.insert(complaintStatusHistory).values({
    complaintId: complaint.id,
    newStatus: "ASSIGNED",
    oldStatus: "CREATED",
    changedAt: now,
  });

  await db.insert(complaintStatusHistory).values({
    complaintId: complaint.id,
    newStatus: "IN_PROGRESS",
    oldStatus: "ASSIGNED",
    changedAt: now,
    changedBy: complaint.assignedStaff,
  });

  await db.insert(complaintStatusHistory).values({
    complaintId: complaint.id,
    newStatus: "RESOLVED",
    oldStatus: "IN_PROGRESS",
    changedAt: new Date(),
    changedBy: complaint.assignedStaff,
  });

  await db.insert(complaintStatusHistory).values({
    complaintId: complaint.id,
    newStatus: "CLOSED",
    oldStatus: "RESOLVED",
    changedAt: new Date(),
    changedBy: complaint.residentId,
  });

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

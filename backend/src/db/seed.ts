import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";

import { hostels, messMenu } from "./schema";
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

  // 2. Hostel
  const [hostel] = await db
    .select()
    .from(hostels)
    .where(eq(hostels.name, "Boys Hostel A"));

  const hostelId = hostel.id;
  const today = new Date();

  // 2. Generate Menu for Today + Next 2 Days
  const menuEntries = [];

  for (let i = 0; i < 3; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i); // i=0 (Today), i=1 (Tomorrow)...

    // Loop through each meal type
    for (const [type, rule] of Object.entries(RULES)) {
      // A. Set Serving Time (e.g., "2026-02-18 13:00:00")
      const servingTime = new Date(currentDate);
      const [hours, minutes] = rule.time.split(":").map(Number);
      servingTime.setHours(hours, minutes, 0, 0);

      // B. Calculate Cutoff Time (Serving - CutoffHours)
      const cutoffTime = new Date(servingTime);
      cutoffTime.setHours(cutoffTime.getHours() - rule.cutoffHours);

      // C. Randomize Items slightly for variety
      const dailyItems = [...rule.items];
      if (Math.random() > 0.5) dailyItems.push("Special Sweet");

      menuEntries.push({
        hostelId,
        date: new Date(currentDate), // Store the base date
        mealType: type as "BREAKFAST" | "LUNCH" | "SNACKS" | "DINNER",
        items: dailyItems.join(", "),
        servingTime,
        cutoffTime,
      });
    }
  }

  // 3. Insert into DB
  if (menuEntries.length > 0) {
    await db.insert(messMenu).values(menuEntries);
    console.log(
      `✅ Successfully added ${menuEntries.length} meals for the next 3 days.`,
    );
  } else {
    console.log("⚠️ No data generated.");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

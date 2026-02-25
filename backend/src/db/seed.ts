import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";

import {
  complaints,
  complaintStatusHistory,
  hostels,
  messMenu,
  resources,
} from "./schema";
import { v4 as uuidv4 } from "uuid";

import { eq, sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  const [hostel] = await db
    .select()
    .from(hostels)
    .where(eq(hostels.name, "Boys Hostel A"));

  await db.insert(resources).values({
    hostelId: hostel.id,
    name: "Laundry 1",
    type: "LAUNDRY",
  });

  await db.insert(resources).values({
    hostelId: hostel.id,
    name: "Laundry 2",
    type: "LAUNDRY",
  });

  await db.insert(resources).values({
    hostelId: hostel.id,
    name: "Laundry 3",
    type: "LAUNDRY",
  });

  await db.insert(resources).values({
    hostelId: hostel.id,
    name: "Laundry 4",
    type: "LAUNDRY",
  });

  console.log("✅ Resources seeded");

  process.exit(0);
}

const runDataMigration = async () => {
  try {
    console.log("🔄 Starting Data Transfer...");

    // 1. Move Staff Data
    await db.execute(sql`
      UPDATE "users" u
      SET phone = s.phone, date_of_birth = s.date_of_birth
      FROM "staff_profiles" s
      WHERE u.id = s.user_id;
    `);
    console.log("✅ Staff data moved.");

    // 2. Move Resident Data
    await db.execute(sql`
      UPDATE "users" u
      SET phone = r.phone, date_of_birth = r.date_of_birth
      FROM "resident_profiles" r
      WHERE u.id = r.user_id;
    `);
    console.log("✅ Resident data moved.");

    // 3. Move Security Data
    await db.execute(sql`
      UPDATE "users" u
      SET phone = sec.phone, date_of_birth = sec.date_of_birth
      FROM "security_profiles" sec
      WHERE u.id = sec.user_id;
    `);
    console.log("✅ Security data moved.");

    console.log("🎉 All data successfully transferred to the users table!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

runDataMigration().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

// seed().catch((err) => {
//   console.error("❌ Seeding failed:", err);
//   process.exit(1);
// });

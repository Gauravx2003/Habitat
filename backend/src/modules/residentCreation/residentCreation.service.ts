import { db } from "../../db";
import {
  users,
  residentProfiles,
  hostels,
  organizations,
  rooms,
  blocks,
} from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Helper: Generate random 8-char password
const generatePassword = () => crypto.randomBytes(4).toString("hex");

export const createResident = async (
  adminUser: {
    hostelId: string;
    organizationId: string;
  },
  residentData: {
    name: string;
    email: string;
    roomId: string;
    enrollmentNumber?: string;
  }
) => {
  //Check if room selected belongs to the same hostel as that of admin
  const roomValidation = await db
    .select({ hostelId: blocks.hostelId })
    .from(rooms)
    .innerJoin(blocks, eq(rooms.blockId, blocks.id))
    .where(eq(rooms.id, residentData.roomId))
    .limit(1);

  if (
    roomValidation.length === 0 ||
    roomValidation[0].hostelId !== adminUser.hostelId
  ) {
    throw new Error("Room not found");
  }

  //Generate Password
  const rawPassword = generatePassword();
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  return await db.transaction(async (tx) => {
    //Create User
    const [newUser] = await tx
      .insert(users)
      .values({
        name: residentData.name,
        email: residentData.email,
        passwordHash,
        role: "RESIDENT",
        isActive: true,
        hostelId: adminUser.hostelId,
        organizationId: adminUser.organizationId,
      })
      .returning();

    //Create Resident Profile
    const [newResidentProfile] = await tx
      .insert(residentProfiles)
      .values({
        userId: newUser.id,
        roomId: residentData.roomId,
        enrollmentNumber: residentData.enrollmentNumber || null,
      })
      .returning();

    //Update Room
    await tx
      .update(rooms)
      .set({ currentOccupancy: sql`current_occupancy + 1` })
      .where(eq(rooms.id, residentData.roomId));

    return {
      ...newUser,
      ...newResidentProfile,
      tempPassword: rawPassword,
    };
  });
};

import { db } from "../../db";
import {
  visitorRequests,
  users,
  residentProfiles,
  rooms,
  blocks,
} from "../../db/schema";
import { desc, eq, getTableColumns, lte, gte, and, sql } from "drizzle-orm";

const generateEntryCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const createRequest = async (
  visitorName: string,
  visitorPhone: string,
  purpose: string,
  relation: string,
  visitDate: Date,
  residentId: string,
) => {
  const entryCode = generateEntryCode();

  const [newRequest] = await db
    .insert(visitorRequests)
    .values({
      residentId,
      visitorName,
      visitorPhone,
      entryCode,
      visitDate,
      relation,
      purpose,
      status: "PENDING",
    })
    .returning();

  return newRequest;
};

export const getMyVisitorRequests = async (
  residentId: string,
  status?: "PENDING" | "APPROVED" | "REJECTED",
) => {
  let query = db
    .select()
    .from(visitorRequests)
    .orderBy(desc(visitorRequests.visitDate));
  query.where(eq(visitorRequests.residentId, residentId));

  if (status) {
    query.where(eq(visitorRequests.status, status));
  }

  const requests = await query;
  return requests;
};

export const getPendingRequests = async () => {
  const requests = await db
    .select({
      ...getTableColumns(visitorRequests),
      residentName: users.name,
    })
    .from(visitorRequests)
    .leftJoin(users, eq(visitorRequests.residentId, users.id))
    .where(eq(visitorRequests.status, "PENDING"))
    .orderBy(desc(visitorRequests.createdAt));
  return requests;
};

export const getAllRequests = async (
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED",
) => {
  const requests = await db
    .select({
      ...getTableColumns(visitorRequests),
      residentName: users.name,
      block: blocks.name,
      roomNumber: rooms.roomNumber,
      residentPhone: users.phone,
    })
    .from(visitorRequests)
    .leftJoin(users, eq(visitorRequests.residentId, users.id))
    .leftJoin(residentProfiles, eq(users.id, residentProfiles.userId))
    .leftJoin(rooms, eq(residentProfiles.roomId, rooms.id))
    .leftJoin(blocks, eq(rooms.blockId, blocks.id))
    .where(status ? eq(visitorRequests.status, status) : undefined)
    .orderBy(desc(visitorRequests.createdAt));
  return requests;
};

export const updateVisitorRequest = async (
  id: string,
  status: "APPROVED" | "REJECTED",
) => {
  const [updatedRequest] = await db
    .update(visitorRequests)
    .set({ status })
    .where(eq(visitorRequests.id, id))
    .returning();

  return updatedRequest;
};

//For Security Watchman
export const getTodaysVisitors = async () => {
  const todaysDate = new Date().toISOString().split("T")[0];

  console.log(todaysDate);

  const todaysVisitors = await db
    .select({
      ...getTableColumns(visitorRequests),
      residentName: users.name,
      block: blocks.name,
      roomNumber: rooms.roomNumber,
      phone: users.phone,
    })
    .from(visitorRequests)
    .leftJoin(users, eq(visitorRequests.residentId, users.id))
    .leftJoin(residentProfiles, eq(users.id, residentProfiles.userId))
    .leftJoin(rooms, eq(residentProfiles.roomId, rooms.id))
    .leftJoin(blocks, eq(rooms.blockId, blocks.id))
    .where(
      and(
        sql`${visitorRequests.status} IN ('APPROVED', 'CLOSED')`,
        sql`DATE(${visitorRequests.visitDate}) = ${todaysDate}`,
      ),
    );

  return todaysVisitors;
};

// Verify Visitor Entry Code (Security Guard)
export const verifyVisitorCode = async (
  visitorId: string,
  entryCode: string,
) => {
  const request = await db.query.visitorRequests.findFirst({
    where: eq(visitorRequests.id, visitorId),
  });

  if (!request) throw new Error("Visitor request not found");

  if (request.status !== "APPROVED") {
    throw new Error("This visitor request is not approved or already verified");
  }

  if (request.entryCode !== entryCode) {
    throw new Error("Invalid entry code");
  }

  // Update status to CLOSED
  await db
    .update(visitorRequests)
    .set({ status: "CLOSED" })
    .where(eq(visitorRequests.id, visitorId));

  return { message: "Visitor verified successfully ✅", visitor: request };
};

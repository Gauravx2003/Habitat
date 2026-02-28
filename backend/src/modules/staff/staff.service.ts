import { db } from "../../db";
import {
  users,
  complaints,
  complaintCategories,
  staffProfiles,
  complaintStatusHistory,
  blocks,
  residentProfiles,
  rooms,
} from "../../db/schema";
import { autoAssignPendingComplaint } from "../support/complaints/complaints.service";
import { createNotification } from "../communication/notifications/notifications.service";

import { eq, and, sql } from "drizzle-orm";

export const getAssignedComplaints = async (
  staffId: string,
  status?: "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED",
) => {
  // Create a base condition array
  const conditions = [eq(complaints.assignedStaff, staffId)];

  // If a status is provided, add it to the conditions
  if (status) {
    conditions.push(eq(complaints.status, status));
  }

  return await db
    .select({
      id: complaints.id,
      title: complaints.title,
      description: complaints.description,
      status: complaints.status,
      priority: complaints.priority,
      createdAt: complaints.createdAt,
      residentId: complaints.residentId,
      category: complaintCategories.name,
      name: users.name,
      phone: users.phone,
      room: rooms.roomNumber,
      block: blocks.name,
    })
    .from(complaints)
    .innerJoin(
      complaintCategories,
      eq(complaintCategories.id, complaints.categoryId),
    )
    .innerJoin(users, eq(users.id, complaints.residentId))
    .innerJoin(residentProfiles, eq(residentProfiles.userId, users.id))
    .innerJoin(rooms, eq(rooms.id, residentProfiles.roomId))
    .innerJoin(blocks, eq(blocks.id, rooms.blockId))
    .where(and(...conditions)); // Spreads all active conditions into the AND block
};

export const updateComplaintStatus = async (
  complaintId: string,
  status: "IN_PROGRESS" | "RESOLVED",
  staffId: string,
) => {
  return await db.transaction(async (tx) => {
    // 1. Fetch the complaint and ensure it belongs to this staff member
    const [complaint] = await tx
      .select()
      .from(complaints)
      .where(
        and(
          eq(complaints.id, complaintId),
          eq(complaints.assignedStaff, staffId),
        ),
      );

    if (!complaint) {
      throw new Error("Complaint not found or unauthorized");
    }

    // 2. State Machine Validation (Prevent skipping steps)
    if (status === "IN_PROGRESS" && complaint.status !== "ASSIGNED") {
      throw new Error(
        "Complaint must be in ASSIGNED state to move to IN_PROGRESS",
      );
    }

    if (status === "RESOLVED" && complaint.status !== "IN_PROGRESS") {
      throw new Error(
        "Complaint must be in IN_PROGRESS state to move to RESOLVED",
      );
    }

    // 3. Update the complaint status
    const [updated] = await tx
      .update(complaints)
      .set({ status })
      .where(eq(complaints.id, complaintId))
      .returning();

    // 4. Handle Side Effects (Notifications & Queues)
    if (status === "IN_PROGRESS") {
      // Notify resident that work has started
      await createNotification(
        tx,
        complaint.residentId,
        "Your complaint is currently in progress.",
      );
    } else if (status === "RESOLVED") {
      // Notify resident that work is finished
      await createNotification(
        tx,
        complaint.residentId,
        "Your complaint has been marked as resolved. Please review and close it.",
      );

      // Decrement the staff's current tasks counter (use GREATEST to prevent negative numbers just in case)
      await tx
        .update(staffProfiles)
        .set({
          currentTasks: sql`GREATEST(${staffProfiles.currentTasks} - 1, 0)`,
        })
        .where(eq(staffProfiles.userId, staffId));

      // 🪄 Trigger the self-healing queue!
      // This immediately checks if there is a 'CREATED' complaint waiting for this staff member
      await autoAssignPendingComplaint(tx, staffId);
    }

    await tx.insert(complaintStatusHistory).values({
      complaintId,
      newStatus: status,
      oldStatus: complaint.status,
      changedAt: new Date(),
      changedBy: staffId,
    });

    return updated;
  });
};

export const getStaffBySpecialization = async (specialization: string) => {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      specialization: staffProfiles.specialization,
      isActive: users.isActive,
    })
    .from(users)
    .innerJoin(staffProfiles, eq(staffProfiles.userId, users.id))
    .where(eq(staffProfiles.specialization, specialization));
};

export const updateStaffStatus = async (staffId: string, isActive: boolean) => {
  return await db
    .update(users)
    .set({ isActive })
    .where(eq(users.id, staffId))
    .returning({
      id: users.id,
      isActive: users.isActive,
    });
};

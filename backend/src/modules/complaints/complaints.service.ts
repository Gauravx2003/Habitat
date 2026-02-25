import { db } from "../../db";
import {
  complaintCategories,
  complaints,
  users,
  staffProfiles,
  rooms,
  escalations,
  complaintStatusHistory,
  complaintMessages,
  blocks,
} from "../../db/schema";
import { createNotification } from "../notifications/notifications.service";

import {
  eq,
  NotNull,
  and,
  sql,
  getTableColumns,
  aliasedTable,
  lt,
  asc,
} from "drizzle-orm";

export const createComplaint = async (
  residentId: string,
  roomId: string,
  categoryId: string,
  description: string,
  title?: string,
) => {
  // Fetch category (for SLA)
  const [category] = await db
    .select()
    .from(complaintCategories)
    .where(eq(complaintCategories.id, categoryId));

  if (!category) {
    throw new Error("Category not found");
  }

  // 1. Finding Staff for resolving the complaint (Optimized Query)
  const result = await db
    .select({
      staffId: users.id,
    })
    .from(users)
    .innerJoin(staffProfiles, eq(users.id, staffProfiles.userId))
    .where(
      and(
        eq(users.role, "STAFF"),
        eq(staffProfiles.staffType, "IN_HOUSE"),
        eq(staffProfiles.specialization, category.name),
        eq(users.isActive, true),
        lt(staffProfiles.currentTasks, staffProfiles.maxActiveTasks), // Compares two columns directly
      ),
    )
    .orderBy(asc(staffProfiles.currentTasks))
    .limit(1);

  const assignedStaff = result.length > 0 ? result[0].staffId : null;

  const slaDeadline = new Date();
  slaDeadline.setHours(slaDeadline.getHours() + category.slaHours);

  // 2. Execute Transaction
  return await db.transaction(async (tx) => {
    // A. Create Complaint
    const [complaint] = await tx
      .insert(complaints)
      .values({
        residentId,
        title,
        roomId,
        categoryId,
        assignedStaff,
        status: assignedStaff ? "ASSIGNED" : "CREATED",
        description,
        slaDeadline,
      })
      .returning();

    await tx.insert(complaintStatusHistory).values({
      complaintId: complaint.id,
      newStatus: "CREATED",
      changedBy: residentId,
    });

    // B. Handle Staff Assignment Side Effects
    if (assignedStaff) {
      // Increment the current_tasks counter for the assigned staff
      await tx
        .update(staffProfiles)
        .set({
          currentTasks: sql`${staffProfiles.currentTasks} + 1`,
        })
        .where(eq(staffProfiles.userId, assignedStaff));

      await tx.insert(complaintStatusHistory).values({
        complaintId: complaint.id,
        newStatus: "ASSIGNED",
        changedBy: residentId,
        changedTo: assignedStaff,
      });

      // Create notification
      await createNotification(tx, assignedStaff, "You have a new complaint");
    }

    return complaint;
  });
};

export const getMyComplaints = async (
  id: string,
  status?:
    | "CREATED"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "CLOSED"
    | "RESOLVED"
    | "ESCALATED",
) => {
  const { complaintAttachments } = await import("../../db/schema");

  let query = db
    .select({
      ...getTableColumns(complaints),
      categoryName: complaintCategories.name,
      staffName: users.name,
    })
    .from(complaints)
    .leftJoin(
      complaintCategories,
      eq(complaints.categoryId, complaintCategories.id),
    )
    .leftJoin(users, eq(complaints.assignedStaff, users.id));

  const filters = [eq(complaints.residentId, id)];

  if (status) {
    filters.push(eq(complaints.status, status));
  }

  const myComplaints = await query.where(and(...filters));

  // Fetch attachments for each complaint
  const complaintsWithAttachments = await Promise.all(
    myComplaints.map(async (complaint) => {
      const attachments = await db
        .select({
          id: complaintAttachments.id,
          fileURL: complaintAttachments.fileURL,
        })
        .from(complaintAttachments)
        .where(eq(complaintAttachments.complaintId, complaint.id));

      return {
        ...complaint,
        attachments,
      };
    }),
  );

  return complaintsWithAttachments;
};

export const getEscalatedComplaints = async () => {
  const staff = aliasedTable(users, "staff");
  const resident = aliasedTable(users, "resident");

  const escalatedComplaints = await db
    .select({
      ...getTableColumns(complaints),
      categoryName: complaintCategories.name,
      residentName: resident.name,
      roomNumber: rooms.roomNumber,
      block: blocks.name,
      assignedStaffName: staff.name,
    })
    .from(complaints)
    .leftJoin(
      complaintCategories,
      eq(complaints.categoryId, complaintCategories.id),
    )
    .leftJoin(resident, eq(complaints.residentId, resident.id))
    .leftJoin(rooms, eq(complaints.roomId, rooms.id))
    .leftJoin(blocks, eq(rooms.blockId, blocks.id))
    .leftJoin(staff, eq(complaints.assignedStaff, staff.id))
    .where(eq(complaints.status, "ESCALATED"));

  return escalatedComplaints;
};

export const getAllComplaintCategories = async () => {
  return await db.select().from(complaintCategories);
};

export const reassignComplaint = async (
  complaintId: string,
  newStaffId: string,
  adminId: string,
) => {
  //Get Existing Complaint
  return await db.transaction(async (tx) => {
    const [existingComplaint] = await tx
      .select({
        ...getTableColumns(complaints),
        slaHours: complaintCategories.slaHours,
      })
      .from(complaints)
      .innerJoin(
        complaintCategories,
        eq(complaints.categoryId, complaintCategories.id),
      )
      .where(eq(complaints.id, complaintId));

    if (!existingComplaint) {
      throw new Error("Complaint not found");
    }

    //Validate Staff
    const [staff] = await tx
      .select()
      .from(users)
      .where(eq(users.id, newStaffId));

    if (!staff) {
      throw new Error("Staff not found");
    }

    if (staff.role !== "STAFF") {
      throw new Error("Staff is not a valid staff member");
    }

    await tx
      .update(staffProfiles)
      .set({ currentTasks: sql`${staffProfiles.currentTasks} + 1` })
      .where(eq(staffProfiles.userId, newStaffId));

    const newSLADeadline = new Date();
    newSLADeadline.setHours(
      newSLADeadline.getHours() + existingComplaint.slaHours,
    );

    //Update the SLA deadline for the complaint
    const [updatedComplaint] = await tx
      .update(complaints)
      .set({
        assignedStaff: newStaffId,
        slaDeadline: newSLADeadline,
        status: "ASSIGNED",
      })
      .where(eq(complaints.id, complaintId))
      .returning();

    await tx.insert(complaintStatusHistory).values({
      complaintId,
      newStatus: "ASSIGNED",
      oldStatus: existingComplaint.status,
      changedAt: new Date(),
      changedBy: adminId,
      changedTo: newStaffId,
    });

    //Create notification for the staff
    await createNotification(tx, newStaffId, "You have a new complaint");

    return updatedComplaint;
  });
};

export const residentCloseComplaint = async (
  complaintId: string,
  residentId: string,
) => {
  return db.transaction(async (tx) => {
    const [complaint] = await tx
      .select()
      .from(complaints)
      .where(
        and(
          eq(complaints.id, complaintId),
          eq(complaints.residentId, residentId),
        ),
      );

    if (!complaint) throw new Error("Complaint not found or unauthorized");
    if (complaint.status !== "RESOLVED")
      throw new Error("Only RESOLVED complaints can be closed");

    const [closedComplaint] = await tx
      .update(complaints)
      .set({ status: "CLOSED" })
      .where(eq(complaints.id, complaintId))
      .returning();

    await tx.insert(complaintStatusHistory).values({
      complaintId,
      newStatus: "CLOSED",
      oldStatus: complaint.status,
      changedAt: new Date(),
      changedBy: residentId,
    });

    return closedComplaint;
  });
};

export const residentRejectResolution = async (
  complaintId: string,
  residentId: string,
  reason: string,
) => {
  return db.transaction(async (tx) => {
    const [complaint] = await tx
      .select()
      .from(complaints)
      .where(
        and(
          eq(complaints.id, complaintId),
          eq(complaints.residentId, residentId),
        ),
      );

    if (!complaint) throw new Error("Complaint not found or unauthorized");
    if (complaint.status !== "RESOLVED")
      throw new Error("Only RESOLVED complaints can be rejected");

    const [escalatedComplaint] = await tx
      .update(complaints)
      .set({ status: "ESCALATED" })
      .where(eq(complaints.id, complaintId))
      .returning();

    const [admin] = await tx
      .select()
      .from(users)
      .where(eq(users.role, "ADMIN"));
    const now = new Date();

    await tx.insert(complaintStatusHistory).values({
      complaintId,
      newStatus: "ESCALATED",
      oldStatus: complaint.status,
      changedAt: new Date(),
      changedBy: residentId,
      changedTo: admin?.id,
    });

    await tx.insert(escalations).values({
      complaintId: complaint.id,
      level: 1,
      escalatedTo: admin?.id,
      escalatedAt: now,
      reason,
    });

    // Note: It will now appear in the Admin's getEscalatedComplaints view
    return escalatedComplaint;
  });
};

export const adminCloseComplaint = async (
  complaintId: string,
  adminId: string,
) => {
  // Admin forceful closure (e.g., resident made a false claim)
  return db.transaction(async (tx) => {
    const [complaint] = await tx
      .select()
      .from(complaints)
      .where(eq(complaints.id, complaintId));

    if (!complaint) throw new Error("Complaint not found");

    const [closedComplaint] = await tx
      .update(complaints)
      .set({ status: "CLOSED" })
      .where(eq(complaints.id, complaintId))
      .returning();

    await tx.insert(complaintStatusHistory).values({
      complaintId,
      newStatus: "CLOSED",
      oldStatus: complaint.status,
      changedAt: new Date(),
      changedBy: adminId,
    });

    return closedComplaint;
  });
};

export const autoAssignPendingComplaint = async (tx: any, staffId: string) => {
  // 1. Get the staff member's profile and specialization
  const [staff] = await tx
    .select()
    .from(staffProfiles)
    .where(eq(staffProfiles.userId, staffId));

  if (!staff || staff.currentTasks >= staff.maxActiveTasks) return;

  // 2. Find the OLDEST "CREATED" complaint that matches their specialization
  const pendingComplaints = await tx
    .select({
      id: complaints.id,
      slaHours: complaintCategories.slaHours,
    })
    .from(complaints)
    .innerJoin(
      complaintCategories,
      eq(complaints.categoryId, complaintCategories.id),
    )
    .where(
      and(
        eq(complaints.status, "CREATED"),
        eq(complaintCategories.name, staff.specialization),
      ),
    )
    .orderBy(asc(complaints.createdAt)) // Oldest first (FIFO queue)
    .limit(1);

  // If no pending complaints exist for this specialization, do nothing
  if (pendingComplaints.length === 0) return;

  const nextComplaint = pendingComplaints[0];

  // 3. Calculate a FRESH SLA deadline since it's only just being assigned
  const newSlaDeadline = new Date();
  newSlaDeadline.setHours(newSlaDeadline.getHours() + nextComplaint.slaHours);

  // 4. Assign the complaint
  await tx
    .update(complaints)
    .set({
      assignedStaff: staffId,
      status: "ASSIGNED",
      slaDeadline: newSlaDeadline,
    })
    .where(eq(complaints.id, nextComplaint.id));

  await tx.insert(complaintStatusHistory).values({
    complaintId: nextComplaint.id,
    newStatus: "ASSIGNED",
    oldStatus: "CREATED",
    changedAt: new Date(),
    changedTo: staffId,
  });

  // 5. Re-increment the staff member's task count (since we just gave them a new one)
  await tx
    .update(staffProfiles)
    .set({
      currentTasks: sql`${staffProfiles.currentTasks} + 1`,
    })
    .where(eq(staffProfiles.userId, staffId));

  // 6. Notify the staff member
  await createNotification(
    tx,
    staffId,
    "A pending complaint has been auto-assigned to you from the queue.",
  );
};

export const getComplaintThread = async (complaintId: string) => {
  // Fetch messages ordered by oldest first (standard chat flow)
  return await db
    .select({
      id: complaintMessages.id,
      message: complaintMessages.message,
      createdAt: complaintMessages.createdAt,
      senderId: complaintMessages.senderId,
      // Fetch sender name to display "John (Staff)" or "Rahul (Resident)"
      senderName: users.name,
      senderRole: users.role,
    })
    .from(complaintMessages)
    .innerJoin(users, eq(complaintMessages.senderId, users.id))
    .where(eq(complaintMessages.complaintId, complaintId))
    .orderBy(asc(complaintMessages.createdAt));
};

export const addMessageToThread = async (
  complaintId: string,
  senderId: string,
  message: string,
) => {
  // 1. Check if complaint is already resolved/closed
  const [complaint] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, complaintId));

  if (!complaint) throw new Error("Complaint not found");
  if (complaint.status === "RESOLVED" || complaint.status === "CLOSED") {
    throw new Error("Cannot send messages on a closed complaint.");
  }

  // 2. Insert Message
  const [newMessage] = await db
    .insert(complaintMessages)
    .values({
      complaintId,
      senderId,
      message,
    })
    .returning();

  // 3. 🚨 The Smart Notification Routing 🚨
  // If Resident sent it -> Notify the Assigned Staff
  // If Staff sent it -> Notify the Resident

  /*
  if (senderId === complaint.userId && complaint.assignedTo) {
      sendPushNotification(complaint.assignedTo, "New message from Resident", message);
  } else if (senderId === complaint.assignedTo) {
      sendPushNotification(complaint.userId, "Update from Maintenance Staff", message);
  }
  */

  return newMessage;
};

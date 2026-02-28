import { Response } from "express";
import { Authenticate } from "../../../middleware/auth";
import {
  bookResourceSlot,
  joinWaitlist,
  cancelAndAutoAssign,
  getResourcesWithStatus,
  getAvailableSlots,
  getAllActiveBookings,
  getAllWaitlistEntries,
  bypassQueueBooking,
  getHeatmapData,
  getWaitlistTurnaround,
  getFlakeRate,
} from "./orchestrator.service";
import { db } from "../../../db";
import { resources, bookings, waitlists } from "../../../db/schema";
import { eq, and, gte, inArray, sql, count } from "drizzle-orm";

// 1. Get All Resources with Live Status
export const getResourcesController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { hostelId } = req.user!;
    const enrichedResources = await getResourcesWithStatus(hostelId);
    res.json(enrichedResources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

// 1b. Get Available Slots for a Resource
export const getAvailableSlotsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { resourceId } = req.params;
    const slots = await getAvailableSlots(resourceId);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available slots" });
  }
};

// 2. Book a Slot (The High-Concurrency Endpoint)
export const bookSlotController = async (req: Authenticate, res: Response) => {
  try {
    const { resourceId, startTime, endTime } = req.body;
    const userId = req.user!.userId;

    const newBooking = await bookResourceSlot(
      userId,
      resourceId,
      new Date(startTime),
      new Date(endTime),
    );

    res.status(201).json({
      message: "Slot booked successfully!",
      booking: newBooking,
    });
  } catch (error: any) {
    // THIS IS THE MAGIC: If the lock was taken, we catch it and send a 409 Conflict.
    // The frontend sees 409 and shows the "Join Waitlist" button.
    if (error.name === "SLOT_TAKEN") {
      return res.status(409).json({
        message: "This slot was just taken by someone else.",
        actionRequired: "JOIN_WAITLIST",
      });
    }

    res.status(400).json({ message: error.message || "Failed to book slot" });
  }
};

// 3. Join the Waitlist
export const joinWaitlistController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { type } = req.body; // "LAUNDRY" or "BADMINTON"
    const { userId, hostelId } = req.user!;

    if (!hostelId)
      return res.status(400).json({ message: "Hostel ID missing" });

    const entry = await joinWaitlist(userId, hostelId, type);

    res.status(201).json({
      message: `You are now on the waitlist for ${type}. We will notify you when a slot opens!`,
      waitlist: entry,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "Failed to join waitlist" });
  }
};

// 4. Cancel Slot (Triggers Auto-Assign)
export const cancelSlotController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { bookingId } = req.params;

    // Optional: Check if the booking actually belongs to req.user.userId
    // before allowing cancellation.

    const result = await cancelAndAutoAssign(bookingId);

    res.json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "Failed to cancel booking" });
  }
};

// 5. Get My Active Bookings & Waitlists
export const getMyQueueController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const userId = req.user!.userId;
    const now = new Date();

    const myBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          inArray(bookings.status, ["CONFIRMED", "ACTIVE"]),
          gte(bookings.endTime, now), // Only fetch future/current slots
        ),
      );

    const myWaitlists = await db
      .select()
      .from(waitlists)
      .where(
        and(eq(waitlists.userId, userId), eq(waitlists.status, "WAITING")),
      );

    res.json({ bookings: myBookings, waitlists: myWaitlists });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your queue" });
  }
};

// ─── 1. RESOURCE MANAGEMENT ───

// Add a new Machine/Court
export const addResourceController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { name, type, hostelId } = req.body;

    const [newResource] = await db
      .insert(resources)
      .values({
        name,
        type, // "LAUNDRY" or "BADMINTON"
        hostelId,
        isOperational: true,
      })
      .returning();

    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: "Failed to add resource" });
  }
};

// Toggle Maintenance Mode (with optional reason)
export const updateResourceStatusController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { resourceId } = req.params;
    const { isOperational, maintenance } = req.body;

    const [updated] = await db
      .update(resources)
      .set({
        isOperational,
        maintenance: isOperational ? null : maintenance || null,
      })
      .where(eq(resources.id, resourceId))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

// ─── 2. GOD MODE ACTIONS ───

// Force Cancel a Booking (Triggers Waitlist Auto-Assign!)
export const forceCancelBookingController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { bookingId } = req.params;

    // We reuse our smart service logic!
    // This ensures if Admin cancels a slot, the next student instantly gets it.
    const result = await cancelAndAutoAssign(bookingId);

    res.json({
      message: "Booking force-cancelled. Waitlist processed.",
      details: result,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ─── 3. ADMIN DATA ENDPOINTS ───

// Get all active bookings (admin view)
export const getAllActiveBookingsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { hostelId } = req.user!;
    const result = await getAllActiveBookings(hostelId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active bookings" });
  }
};

// Get current waitlist (admin view)
export const getAllWaitlistController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { hostelId } = req.user!;
    const type = (req.query.type as "LAUNDRY" | "BADMINTON") || "LAUNDRY";
    const result = await getAllWaitlistEntries(hostelId, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch waitlist" });
  }
};

// Bypass queue – admin manually assigns a slot
export const bypassQueueController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { userId, resourceId, startTime, endTime } = req.body;
    const result = await bypassQueueBooking(
      userId,
      resourceId,
      new Date(startTime),
      new Date(endTime),
    );
    res.status(201).json({
      message: "Slot assigned successfully (queue bypassed).",
      booking: result,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to assign slot" });
  }
};

// ─── 4. ANALYTICS ───

export const getOrchestratorStats = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { hostelId, type } = req.query; // type = 'LAUNDRY'

    // A. Basic Counts
    const [totalBookings] = await db
      .select({ count: count() })
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id))
      .where(
        and(
          eq(resources.hostelId, hostelId as string),
          eq(resources.type, type as "LAUNDRY" | "BADMINTON"),
        ),
      );

    // B. The "No-Show" Rate (Cancelled vs Completed)
    const statusBreakdown = await db
      .select({
        status: bookings.status,
        count: count(),
      })
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id))
      .where(
        and(
          eq(resources.hostelId, hostelId as string),
          eq(resources.type, type as any),
        ),
      )
      .groupBy(bookings.status);

    // C. Waitlist Load
    const currentWaitlist = await db
      .select({ count: count() })
      .from(waitlists)
      .where(
        and(
          eq(waitlists.hostelId, hostelId as string),
          eq(waitlists.type, type as any),
          eq(waitlists.status, "WAITING"),
        ),
      );

    // D. Peak Usage Day (Which day has most bookings?)
    // Note: This is a simplified SQL aggregation example
    const peakDays = await db.execute(sql`
      SELECT TO_CHAR(start_time, 'Day') as day_name, COUNT(*) as usage_count
      FROM bookings
      JOIN resources ON bookings.resource_id = resources.id
      WHERE resources.hostel_id = ${hostelId} AND resources.type = ${type}
      GROUP BY day_name
      ORDER BY usage_count DESC
      LIMIT 3
    `);

    res.json({
      totalBookings: totalBookings.count,
      activeWaitlist: currentWaitlist[0].count,
      breakdown: statusBreakdown,
      peakDays: peakDays.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

// Heatmap analytics
export const getHeatmapController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { hostelId } = req.user!;
    const result = await getHeatmapData(hostelId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch heatmap data" });
  }
};

// Waitlist turnaround analytics
export const getWaitlistTurnaroundController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { hostelId } = req.user!;
    const result = await getWaitlistTurnaround(hostelId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch waitlist turnaround" });
  }
};

// Flake rate analytics
export const getFlakeRateController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { hostelId } = req.user!;
    const result = await getFlakeRate(hostelId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch flake rate" });
  }
};

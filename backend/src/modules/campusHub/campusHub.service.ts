import { db } from "../../db";
import { events, notices, hostels, eventsAttachments } from "../../db/schema";
import { eq, desc, and, gte, lte, or, inArray } from "drizzle-orm";


// --- EVENTS ---

export const createEvent = async (data: typeof events.$inferInsert) => {
  const [newEvent] = await db.insert(events).values(data).returning();
  return newEvent;
};

export const updateEvent = async (
  eventId: string,
  data: Partial<typeof events.$inferInsert>,
) => {
  const [updatedEvent] = await db
    .update(events)
    .set(data)
    .where(eq(events.id, eventId))
    .returning();
  return updatedEvent;
};

export const deleteEvent = async (eventId: string) => {
  await db.delete(events).where(eq(events.id, eventId));
  return { message: "Event deleted successfully" };
};

// --- NOTICES & SCHEDULES ---

export const createNotice = async (data: typeof notices.$inferInsert) => {
  const [newNotice] = await db.insert(notices).values(data).returning();

  // (Optional) If it's URGENT, trigger Push Notification logic here
  if (data.type === "EMERGENCY" || data.type === "ANNOUNCEMENT") {
    // sendPushNotificationToAll(...)
  }

  return newNotice;
};

export const updateNotice = async (
  noticeId: string,
  data: Partial<typeof notices.$inferInsert>,
) => {
  const [updatedNotice] = await db
    .update(notices)
    .set(data)
    .where(eq(notices.id, noticeId))
    .returning();
  return updatedNotice;
};

export const deleteNotice = async (noticeId: string) => {
  await db.delete(notices).where(eq(notices.id, noticeId));
  return { message: "Notice deleted successfully" };
};

// --- THE MAIN FETCH (AGGREGATOR) ---

export const getCampusHubData = async (hostelId: string, isAdmin = false) => {
  const now = new Date();

  // 1. Fetch Events
  // If Admin, fetch all. If Resident, fetch only future.
  const eventConditions = [eq(events.hostelId, hostelId)];
  if (!isAdmin) {
    eventConditions.push(gte(events.startDate, now));
  }

  /* 
     Update: We now need to fetch attachments for each event.
     We'll fetch events first, then fetch their attachments, and map them.
     Or use a left join if Drizzle supports it easily for one-to-many, 
     but separate queries are often cleaner for agg roots.
  */

  const upcomingEvents = await db
    .select()
    .from(events)
    .where(and(...eventConditions))
    .orderBy(events.startDate);

  // Fetch attachments for these events
  const eventIds = upcomingEvents.map((e) => e.id);
  let eventAttachmentsMap: Record<string, string> = {};

  if (eventIds.length > 0) {
    const attachments = await db
      .select({
        eventId: eventsAttachments.eventId,
        fileUrl: eventsAttachments.fileURL,
      })
      .from(eventsAttachments)
      .where(inArray(eventsAttachments.eventId, eventIds));

    // Map eventId -> first fileUrl (since we just want a banner)
    attachments.forEach((att) => {
      if (!eventAttachmentsMap[att.eventId]) {
        eventAttachmentsMap[att.eventId] = att.fileUrl;
      }
    });
  }

  // Attach bannerUrl from attachments if not present in main table (or override)
  const eventsWithAttachments = upcomingEvents.map((event) => ({
    ...event,
    bannerUrl: eventAttachmentsMap[event.id] || event.bannerUrl,
  }));

  // 2. Fetch Notices (General & Urgent)
  // If Admin, fetch all types (including SCHEDULE for the raw list? No, separate tabs).
  // Actually, for Admin, we might want a raw list of everything.
  // But let's stick to the structure: Events, Notices (Announcement/Emergency), Schedule.

  const noticeConditions: any[] = [
    eq(notices.hostelId, hostelId),
    or(eq(notices.type, "ANNOUNCEMENT"), eq(notices.type, "EMERGENCY")),
  ];

  if (!isAdmin) {
    noticeConditions.push(eq(notices.isActive, true));
  }

  const activeNotices = await db
    .select()
    .from(notices)
    .where(and(...noticeConditions))
    .orderBy(desc(notices.createdAt));

  // 3. Fetch Schedule
  // If Admin, fetch ALL schedules? Or just future? Admin probably wants to see history too.
  const scheduleConditions: any[] = [
    eq(notices.hostelId, hostelId),
    eq(notices.type, "SCHEDULE"),
  ];

  if (!isAdmin) {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    scheduleConditions.push(
      gte(notices.scheduledFor, startOfDay),
      lte(notices.scheduledFor, endOfDay),
    );
  }

  const dailySchedule = await db
    .select()
    .from(notices)
    .where(and(...scheduleConditions))
    .orderBy(desc(notices.scheduledFor));

  return {
    events: eventsWithAttachments,
    notices: activeNotices,
    schedule: dailySchedule,
  };
};

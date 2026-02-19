import { Expo } from "expo-server-sdk";
import { db } from "../db";
import { users } from "../db/schema";
import { isNotNull, eq } from "drizzle-orm";

// Initialize Expo SDK
const expo = new Expo();

export const sendPushNotificationToAll = async (
  title: string,
  body: string,
  data?: any,
) => {
  // 1. Fetch all users with a valid push token
  const recipients = await db
    .select({ token: users.pushToken })
    .from(users)
    .where(isNotNull(users.pushToken));

  if (recipients.length === 0) return;

  // 2. Prepare messages
  let messages: any[] = [];

  for (let user of recipients) {
    if (!Expo.isExpoPushToken(user.token)) {
      console.error(`Push token ${user.token} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: user.token,
      sound: "default",
      title: title,
      body: body,
      data: data || {
        route: "/(resident)/campus-hub",
        params: { tab: "Notices" },
      }, // Deep link to Notices page
      priority: "high",
    });
  }

  // 3. Send in Batches (Expo recommends this)
  let chunks = expo.chunkPushNotifications(messages);

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("🚀 Notification Chunk Sent:", ticketChunk);
    } catch (error) {
      console.error("❌ Error sending chunk:", error);
    }
  }
};

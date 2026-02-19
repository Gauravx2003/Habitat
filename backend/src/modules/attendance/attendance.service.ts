import redis from "../../config/redis";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../db";
import { attendanceLogs, users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const generateQR = async () => {
  const token = uuidv4();

  await redis.set(`qr:${token}`, "VALID", "EX", 15);

  return { token };
};

export const verifyQR = async (token: string, userId: string) => {
  // Check if token exists in Redis
  const isValid = await redis.get(`qr:${token}`);

  if (!isValid) {
    throw new Error("QR Code Expired or Invalid");
  }

  // If valid, immediately delete it so it can't be reused (Replay Attack Prevention)
  await redis.del(`qr:${token}`);

  // Find the LAST log for this user
  return await db.transaction(async (tx) => {
    const lastLog = await tx.query.attendanceLogs.findFirst({
      // Use the callback to access 'eq' and the table columns
      where: (attendanceLogs, { eq }) => eq(attendanceLogs.userId, userId),

      // Use the callback to access 'desc' and the table columns
      orderBy: (attendanceLogs, { desc }) => [desc(attendanceLogs.scanTime)],
    });

    let newDirection = "OUT"; // Default if no logs (First time leaving)
    if (lastLog && lastLog.direction === "OUT") {
      newDirection = "IN"; // If last was OUT, now they are coming IN
    }

    await tx.insert(attendanceLogs).values({
      userId: userId,
      direction: newDirection,
      qrTokenUsed: token,
    });

    await tx
      .update(users)
      .set({
        isActive: newDirection === "IN",
      })
      .where(eq(users.id, userId));

    return { message: `Successfully marked as ${newDirection}` };
  });
};

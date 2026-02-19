import { Authenticate } from "../../middleware/auth";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { Response } from "express";

export const updatePushTokenController = async (
  req: Authenticate,
  res: Response,
) => {
  const { token } = req.body;

  await db
    .update(users)
    .set({ pushToken: token })
    .where(eq(users.id, req.user!.userId));

  res.json({ message: "Token updated" });
};

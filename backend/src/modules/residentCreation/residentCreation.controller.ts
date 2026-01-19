import { Authenticate } from "../../middleware/auth";
import { Response } from "express";
import { createResident } from "./residentCreation.service";
import { blocks, hostels, rooms } from "../../db/schema";
import { eq, lt, and } from "drizzle-orm";
import { db } from "../../db";

export const createResidentController = async (
  req: Authenticate,
  res: Response
) => {
  try {
    const { adminUser, residentData } = req.body;
    const resident = await createResident(adminUser, residentData);
    res.status(201).json(resident);
  } catch (error) {
    console.error("Error creating resident:", error);
    res.status(500).json({ error: "Failed to create resident" });
  }
};

export const getHostelBlocksController = async (
  req: Authenticate,
  res: Response
) => {
  try {
    const { hostelId } = req.params;
    const block = await db
      .select()
      .from(blocks)
      .where(eq(blocks.hostelId, hostelId));
    res.status(200).json(block);
  } catch (error) {
    console.error("Error getting hostel blocks:", error);
    res.status(500).json({ error: "Failed to get hostel blocks" });
  }
};

export const getBlockRoomsController = async (
  req: Authenticate,
  res: Response
) => {
  try {
    const { blockId } = req.params;
    const room = await db
      .select()
      .from(rooms)
      .where(
        and(
          eq(rooms.blockId, blockId),
          lt(rooms.currentOccupancy, rooms.capacity)
        )
      );

    res.status(200).json(room);
  } catch (error) {
    console.error("Error getting block rooms:", error);
    res.status(500).json({ error: "Failed to get block rooms" });
  }
};

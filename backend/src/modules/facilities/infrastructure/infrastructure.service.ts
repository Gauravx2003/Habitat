import { db } from "../../../db";
import { blocks, rooms, roomTypes, hostels } from "../../../db/schema";
import { eq, inArray, sql, and } from "drizzle-orm";

// ─── SCENARIO 1: Master Data (Room Types) ───
// Admin says: "We are introducing a new 'Premium Suite' category."
export const createRoomType = async (
  organizationId: string,
  data: { name: string; price: number; capacity: number; description?: string },
) => {
  return await db
    .insert(roomTypes)
    .values({
      organizationId,
      ...data,
    })
    .returning();
};

// ─── SCENARIO 2: Empty Block Construction ───
// Admin says: "We just built 'Block D', but haven't numbered the rooms yet."
export const createBlock = async (hostelId: string, name: string) => {
  return await db
    .insert(blocks)
    .values({
      hostelId,
      name,
    })
    .returning();
};

// ─── SCENARIO 3: Bulk Room Creation (The Workhorse) ───
// Admin says: "Add rooms 101-120 to Block A, all Standard Doubles."
export const addRoomsToBlock = async (
  blockId: string,
  typeId: string,
  roomNumbers: string[], // Array of ["101", "102", "103"...]
) => {
  // 1. Check for overlapping room numbers in this block
  const existingRooms = await db
    .select({ roomNumber: rooms.roomNumber })
    .from(rooms)
    .where(eq(rooms.blockId, blockId));

  const existingNumbers = new Set(existingRooms.map((r) => r.roomNumber));
  const overlapping = roomNumbers.filter((num) => existingNumbers.has(num));

  if (overlapping.length > 0) {
    throw {
      statusCode: 409,
      message: `Rooms already exist in this block: ${overlapping.join(", ")}`,
      overlapping,
    };
  }

  // 2. Prepare the data array
  const roomsData = roomNumbers.map((num) => ({
    roomNumber: num,
    blockId: blockId,
    type: typeId,
    currentOccupancy: 0,
  }));

  // 3. Bulk Insert (Drizzle handles this efficiently)
  return await db.insert(rooms).values(roomsData).returning();
};

// ─── SCENARIO 4: The "Mega Wizard" (New Block + New Rooms) ───
// Admin says: "I built 'Block E'. It has 3 floors. Rooms 101-110, 201-210. All are Single AC."
export const initializeNewBlock = async (
  hostelId: string,
  blockName: string,
  roomConfig: {
    typeId: string; // The ID of the Room Type (must exist)
    roomNumbers: string[];
  },
) => {
  // We use a Transaction to ensure Atomicity
  return await db.transaction(async (tx) => {
    // A. Create the Block first
    const [newBlock] = await tx
      .insert(blocks)
      .values({ hostelId, name: blockName })
      .returning();

    // B. Bulk Create the Rooms linked to this new Block
    const roomsData = roomConfig.roomNumbers.map((num) => ({
      roomNumber: num,
      blockId: newBlock.id,
      type: roomConfig.typeId,
      currentOccupancy: 0,
    }));

    if (roomsData.length > 0) {
      await tx.insert(rooms).values(roomsData);
    }

    return newBlock;
  });
};

// ─── SCENARIO 4 (UPGRADED): Mixed-Type Block Construction ───
// Admin says: "Block E has 10 Standard rooms (101-110) AND 5 Deluxe rooms (201-205)."

type RoomConfig = {
  typeId: string; // The ID for "Standard", "Deluxe", etc.
  roomNumbers: string[]; // ["101", "102", ...]
};

export const initializeNewBlockMixed = async (
  hostelId: string,
  blockName: string,
  configurations: RoomConfig[], // <-- Now accepts an ARRAY
) => {
  return await db.transaction(async (tx) => {
    // A. Create the Block first (The Container)
    const [newBlock] = await tx
      .insert(blocks)
      .values({ hostelId, name: blockName })
      .returning();

    // B. Process each configuration group
    // We loop through the array: First do the Standard rooms, then the Deluxe rooms
    for (const config of configurations) {
      if (config.roomNumbers.length > 0) {
        const roomsData = config.roomNumbers.map((num) => ({
          roomNumber: num,
          blockId: newBlock.id, // Link to the block we just made
          type: config.typeId,
          currentOccupancy: 0,
        }));

        // Bulk insert this batch
        await tx.insert(rooms).values(roomsData);
      }
    }

    return newBlock;
  });
};

// ─── READ: Blocks Overview with Room Details ───
export const getBlocksOverview = async (hostelId: string) => {
  // Get all blocks for this hostel
  const allBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.hostelId, hostelId));

  const result = [];

  for (const block of allBlocks) {
    // Get all rooms in this block, joined with room type info
    const blockRooms = await db
      .select({
        roomId: rooms.id,
        roomNumber: rooms.roomNumber,
        currentOccupancy: rooms.currentOccupancy,
        typeId: roomTypes.id,
        typeName: roomTypes.name,
        typeCapacity: roomTypes.capacity,
        typePrice: roomTypes.price,
      })
      .from(rooms)
      .innerJoin(roomTypes, eq(rooms.type, roomTypes.id))
      .where(eq(rooms.blockId, block.id));

    // Group rooms by type
    const typeMap: Record<
      string,
      {
        typeId: string;
        typeName: string;
        capacity: number;
        price: number;
        totalRooms: number;
        occupiedRooms: number;
      }
    > = {};

    for (const room of blockRooms) {
      if (!typeMap[room.typeId]) {
        typeMap[room.typeId] = {
          typeId: room.typeId,
          typeName: room.typeName,
          capacity: room.typeCapacity ?? 1,
          price: room.typePrice,
          totalRooms: 0,
          occupiedRooms: 0,
        };
      }
      typeMap[room.typeId].totalRooms++;
      if ((room.currentOccupancy ?? 0) > 0) {
        typeMap[room.typeId].occupiedRooms++;
      }
    }

    result.push({
      id: block.id,
      name: block.name,
      totalRooms: blockRooms.length,
      occupiedRooms: blockRooms.filter((r) => (r.currentOccupancy ?? 0) > 0)
        .length,
      roomTypes: Object.values(typeMap),
    });
  }

  return result;
};

// ─── READ: Aggregate Occupancy Statistics ───
export const getOccupancyStats = async (hostelId: string) => {
  // Get all blocks for this hostel
  const allBlocks = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(eq(blocks.hostelId, hostelId));

  if (allBlocks.length === 0) {
    return {
      totalRooms: 0,
      occupiedRooms: 0,
      vacantRooms: 0,
      occupancyRate: 0,
      byType: [],
    };
  }

  const blockIds = allBlocks.map((b) => b.id);

  // Get all rooms across all blocks, with type info
  const allRooms = await db
    .select({
      currentOccupancy: rooms.currentOccupancy,
      typeName: roomTypes.name,
      typeId: roomTypes.id,
    })
    .from(rooms)
    .innerJoin(roomTypes, eq(rooms.type, roomTypes.id))
    .where(inArray(rooms.blockId, blockIds));

  const totalRooms = allRooms.length;
  const occupiedRooms = allRooms.filter(
    (r) => (r.currentOccupancy ?? 0) > 0,
  ).length;
  const vacantRooms = totalRooms - occupiedRooms;
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Per-type breakdown
  const typeBreakdown: Record<
    string,
    { typeId: string; typeName: string; total: number; occupied: number }
  > = {};

  for (const room of allRooms) {
    if (!typeBreakdown[room.typeId]) {
      typeBreakdown[room.typeId] = {
        typeId: room.typeId,
        typeName: room.typeName,
        total: 0,
        occupied: 0,
      };
    }
    typeBreakdown[room.typeId].total++;
    if ((room.currentOccupancy ?? 0) > 0) {
      typeBreakdown[room.typeId].occupied++;
    }
  }

  return {
    totalRooms,
    occupiedRooms,
    vacantRooms,
    occupancyRate,
    byType: Object.values(typeBreakdown),
  };
};

// ─── READ: List All Room Types ───
export const getRoomTypes = async (organizationId: string) => {
  return await db
    .select()
    .from(roomTypes)
    .where(eq(roomTypes.organizationId, organizationId));
};

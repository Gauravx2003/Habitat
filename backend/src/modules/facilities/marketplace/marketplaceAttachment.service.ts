// modules/support/complaints/attachments.service.ts
import { db } from "../../../db";
import { marketplaceAttachments, marketplaceItems } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { uploadMultipleFiles } from "../../../utils/cloudinary.upload";

export const uploadMarketplaceAttachment = async (
  files: Express.Multer.File[],
  uploadedBy: string,
  itemId: string,
) => {
  // 1. Safety Checks
  const [existingItem] = await db
    .select()
    .from(marketplaceItems)
    .where(eq(marketplaceItems.id, itemId))
    .limit(1);

  if (!existingItem) throw new Error("Item not found");
  if (existingItem.sellerId !== uploadedBy) {
    throw new Error("Unauthorized");
  }

  // 2. Use the Shared Utility!
  const uploadedResults = await uploadMultipleFiles(
    files,
    "hostel-marketplace",
  );

  // 3. Batch Insert into Complaints DB
  const records = await db
    .insert(marketplaceAttachments)
    .values(
      uploadedResults.map((img) => ({
        itemId: itemId,
        uploadedBy,
        fileURL: img.url,
        publicId: img.publicId,
      })),
    )
    .returning();

  return records;
};

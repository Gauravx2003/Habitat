import cloudinary from "../../config/cloudinary";
import { db } from "../../db";
import { eventsAttachments, events } from "../../db/schema";
import { eq } from "drizzle-orm";

export const uploadAttachment = async (
  files: Express.Multer.File[],
  uploadedBy: string,
  eventId: string,
) => {
  //Safety checks whether if complaint exists and if the user is authorized to upload attachments
  const existingEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (existingEvent.length == 0) {
    throw new Error("Event not found");
  }

  //Parallel upload to cloudinary
  const uploadPromises = files.map((files) => {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "hostel-events",
        },
        (error, result) => {
          if (error || !result) {
            reject(error);
          } else {
            resolve({ url: result.url, publicId: result.public_id });
          }
        },
      );
      uploadStream.end(files.buffer);
    });
  });

  // Wait for ALL uploads to finish
  const uploadedResults = await Promise.all(uploadPromises);

  // 3. Batch Insert into Database
  // Instead of inserting one by one, we insert all at once
  const records = await db
    .insert(eventsAttachments)
    .values(
      uploadedResults.map((img) => ({
        eventId,
        uploadedBy,
        fileURL: img.url,
        publicId: img.publicId,
      })),
    )
    .returning();

  return records;
};

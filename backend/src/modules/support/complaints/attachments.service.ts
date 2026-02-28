import cloudinary from "../../../config/cloudinary";
import { db } from "../../../db";
import { complaintAttachments, complaints } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const uploadAttachment = async (
  files: Express.Multer.File[],
  uploadedBy: string,
  complaintId: string,
) => {
  //Safety checks whether if complaint exists and if the user is authorized to upload attachments
  const existingComplaint = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, complaintId))
    .limit(1);

  if (existingComplaint.length == 0) {
    throw new Error("Complaint not found");
  }

  if (existingComplaint[0].residentId !== uploadedBy) {
    throw new Error(
      "Unauthorized: You are not authorized to upload attachments for this complaint",
    );
  }

  //Parallel upload to cloudinary
  const uploadPromises = files.map((files) => {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "hostel-complaints",
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
    .insert(complaintAttachments)
    .values(
      uploadedResults.map((img) => ({
        complaintId,
        uploadedBy,
        fileURL: img.url,
        publicId: img.publicId,
      })),
    )
    .returning();

  return records;
};

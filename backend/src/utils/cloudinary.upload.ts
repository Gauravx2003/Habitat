// src/utils/upload.util.ts
import cloudinary from "../config/cloudinary";

export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  folderName: string,
) => {
  const uploadPromises = files.map((file) => {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error || !result) {
            reject(error);
          } else {
            resolve({ url: result.url, publicId: result.public_id });
          }
        },
      );
      // End the stream with the file buffer
      uploadStream.end(file.buffer);
    });
  });

  // Wait for all uploads to finish and return the array of results
  return await Promise.all(uploadPromises);
};

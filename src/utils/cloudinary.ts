import { UploadApiResponse } from "cloudinary";
import cloudinary from "../lib/cloudinary";

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result as UploadApiResponse);
      },
    );

    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export const cloudinaryUtils = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
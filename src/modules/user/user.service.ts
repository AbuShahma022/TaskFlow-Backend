import httpStatus from "http-status";
import {prisma} from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { IUpdateProfile } from "./user.interface";
import { cloudinaryUtils } from "../../utils/cloudinary";

const updateProfile = async (
  userId: string,
  payload: IUpdateProfile,
  file?: Express.Multer.File,
) => {
const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.deletedAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account has been deleted",
    );
  }

  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account has been blocked",
    );
  }

  let avatar = user.avatar;
  let avatarPublicId = user.avatarPublicId;

  let newAvatarPublicId: string | undefined;

  if (file) {
    const uploadedImage = await cloudinaryUtils.uploadToCloudinary(
      file.buffer,
      `taskflow/users/${userId}/avatar`,
    );

    avatar = uploadedImage.secure_url;
    avatarPublicId = uploadedImage.public_id;
    newAvatarPublicId = uploadedImage.public_id;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...payload,
        avatar,
        avatarPublicId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Delete the previous Cloudinary avatar only after
    // the database has been successfully updated.
   if (file && user.avatarPublicId) {
  try {
    await cloudinaryUtils.deleteFromCloudinary(user.avatarPublicId);
  } catch (error) {
    console.error("Failed to delete old avatar:", error);
  }
}

    return updatedUser;
  } catch (error) {
    // If database update fails, remove the newly uploaded image
    // so we don't leave an orphaned Cloudinary file.
    if (newAvatarPublicId) {
      await cloudinaryUtils.deleteFromCloudinary(newAvatarPublicId);
    }

    throw error;
  }
  
};

export const userService = {
  updateProfile,
};
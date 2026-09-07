import httpStatus from "http-status";
import {prisma} from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { IChangePassword, IUpdateProfile } from "./user.interface";
import { cloudinaryUtils } from "../../utils/cloudinary";
import config from "../../config";
import bcrypt from "bcryptjs";

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

const changePassword = async (
  userId: string,
  payload: IChangePassword,
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

  if (!user.passwordHash) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password change is not available for this account",
    );
  }

  const isPasswordCorrect = await bcrypt.compare(
    payload.currentPassword,
    user.passwordHash,
  );

  if (!isPasswordCorrect) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect",
    );
  }

  const isSamePassword = await bcrypt.compare(
    payload.newPassword,
    user.passwordHash,
  );

  if (isSamePassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password must be different from the current password",
    );
  }

  const newPasswordHash = await bcrypt.hash(
    payload.newPassword,
    config.bcryptSaltRounds,
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return null;
};

const getAllUsers = async (query: {
  page?: string;
  limit?: string;
  search?: string;
  role?: "ADMIN" | "USER";
  status?: "ACTIVE" | "BLOCKED";
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(query.role && {
      role: query.role,
    }),
    ...(query.status && {
      status: query.status,
    }),
    ...(query.search && {
      OR: [
        {
          name: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
        {
          email: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [query.sortBy || "createdAt"]: query.sortOrder || "desc",
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
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserStatus = async (
  adminId: string,
  userId: string,
  status: "ACTIVE" | "BLOCKED",
) => {
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own account status",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  if (user.deletedAt) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot change status of a deleted user",
    );
  }

  if (user.role === "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot change another admin's status",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
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

  return updatedUser;
};

const deleteUser = async (adminId: string, userId: string) => {
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot delete your own account",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  if (user.deletedAt) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is already deleted",
    );
  }

  if (user.role === "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot delete another admin",
    );
  }

  const deletedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      deletedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      deletedAt: true,
    },
  });

  return deletedUser;
};

export const userService = {
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
  deleteUser,
};
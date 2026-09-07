import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";

const updateProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.updateProfile(
      req.user!.id,
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  },
  
);

const changePassword = catchAsync(async (req, res) => {
  await userService.changePassword(
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query as {
    page?: string;
    limit?: string;
    search?: string;
    role?: "ADMIN" | "USER";
    status?: "ACTIVE" | "BLOCKED";
    sortBy?: "name" | "email" | "createdAt";
    sortOrder?: "asc" | "desc";
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.users,
    meta: result.meta,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const result = await userService.updateUserStatus(
    req.user!.id,
    req.params.id as string,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const result = await userService.deleteUser(
    req.user!.id,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const userController = {
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
  deleteUser,
};
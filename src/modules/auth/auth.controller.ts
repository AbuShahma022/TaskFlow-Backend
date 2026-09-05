import type { Request, Response } from "express";

import httpStatus from "http-status";

import { authService } from "./auth.service";

import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});
export const authController = {
  register,
};
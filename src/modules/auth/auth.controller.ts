import type { Request, Response } from "express";

import httpStatus from "http-status";

import { authService } from "./auth.service";

import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import config from "../../config";
import AppError from "../../utils/AppError";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  // Access Token Cookie
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
  });

  // Refresh Token Cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    },
  });
});


const getMe = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User information retrieved successfully",
    data: req.user,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Refresh token is required",
    );
  }

  const result = await authService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken: result.accessToken,
    },
  });
});

const sendVerificationOTP = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.sendVerificationOTP(
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Verification OTP sent successfully",
      data: result,
    });
  },
);

const verifyEmail = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.verifyEmail(
      req.user!.id,
      req.body.otp,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  },
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(
      req.body.email,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset OTP sent successfully",
      data: result,
    });
  },
);

const verifyResetOTP = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.verifyResetOTP(
      req.body.email,
      req.body.otp,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset OTP verified successfully",
      data: result,
    });
  },
);

const resetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.resetPassword(
      req.body.email,
      req.body.otp,
      req.body.newPassword,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset successfully",
      data: result,
    });
  },
);

export const authController = {
  register,
  login,
  getMe,
  sendVerificationOTP,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};
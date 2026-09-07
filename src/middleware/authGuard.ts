import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import config from "../config";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";
import { jwtUtils } from "../utils/jwt";
import catchAsync from "../utils/catchAsync";
import { UserRole, UserStatus } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        emailVerified: boolean;
      };
    }
  }
}

const authGuard = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized",
      );
    }

    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt.accessTokenSecret,
    );

    if (!verifiedToken.success) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired access token",
      );
    }

    const payload = verifiedToken.data as {
      userId: string;
      email: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "User not found",
      );
    }

    if (user.deletedAt) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This account has been deleted",
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This account has been blocked",
      );
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    };

    next();
  },
);

export default authGuard;
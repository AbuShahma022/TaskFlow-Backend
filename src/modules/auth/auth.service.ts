import bcrypt from "bcryptjs";
import httpStatus from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { ILoginUser, IRegisterUser } from "./auth.interface";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";


const register = async (payload: IRegisterUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email",
    );
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    config.bcryptSaltRounds,
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return user;
};

const login = async (payload: ILoginUser) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  // User not found
  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  // Deleted user
  if (user.deletedAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account has been deleted",
    );
  }

  // Blocked user
  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account has been blocked",
    );
  }

  // Google-only account
  if (!user.passwordHash) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account does not have a password. Please use Google login.",
    );
  }

  // Compare password
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.passwordHash,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  // JWT payload
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Access Token
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.accessTokenSecret,
    config.jwt.accessTokenExpiresIn as SignOptions,
  );

  // Refresh Token
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.refreshTokenSecret,
    config.jwt.refreshTokenExpiresIn as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    },
  };
};

const refreshToken = async (token: string) => {
  const verifiedToken = jwtUtils.verifyToken(
    token,
    config.jwt.refreshTokenSecret,
  );

  if (!verifiedToken.success) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token",
    );
  }

  const payload = verifiedToken.data as {
    userId: string;
    email: string;
    role: string;
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

  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account has been blocked",
    );
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.accessTokenSecret,
    config.jwt.accessTokenExpiresIn as SignOptions,
  );

  return {
    accessToken,
  };
};

export const authService = {
  register,
  login,
  refreshToken,
};
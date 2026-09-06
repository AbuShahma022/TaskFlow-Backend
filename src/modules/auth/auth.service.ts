import bcrypt from "bcryptjs";
import httpStatus from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { ILoginUser, IRegisterUser } from "./auth.interface";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";
import { redisUtils } from "../../utils/redis";
import generateOTP from "../../utils/otp";
import sendEmail from "../../utils/sendEmail";


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

const sendVerificationOTP = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      status: true,
      deletedAt: true,
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

  if (user.emailVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email is already verified",
    );
  }

  const otp = generateOTP();

  await redisUtils.setValue(
    `email_verification:${user.email}`,
    otp,
    300,
  );

await sendEmail({
  to: user.email,
  subject: "TaskFlow Email Verification OTP",
  html: `
    <div>
      <h2>TaskFlow Email Verification</h2>
      <p>Your verification OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
    </div>
  `,
});
  return {
    email: user.email,
  };
};

const verifyEmail = async (userId: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      status: true,
      deletedAt: true,
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

  if (user.emailVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email is already verified",
    );
  }

  const storedOTP = await redisUtils.getValue(
    `email_verification:${user.email}`,
  );

  if (!storedOTP) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "OTP has expired or does not exist",
    );
  }

  if (storedOTP !== otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP",
    );
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
    },
  });

  await redisUtils.deleteValue(
    `email_verification:${user.email}`,
  );

  return {
    email: user.email,
    emailVerified: true,
  };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No account found with this email",
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

  const otp = generateOTP();

  await redisUtils.setValue(
    `password_reset:${user.email}`,
    otp,
    300,
  );

  await sendEmail({
    to: user.email,
    subject: "TaskFlow Password Reset OTP",
    html: `
      <div>
        <h2>TaskFlow Password Reset</h2>
        <p>Your password reset OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });

  return {
    email: user.email,
  };
};

const verifyResetOTP = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No account found with this email",
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

  const storedOTP = await redisUtils.getValue(
    `password_reset:${user.email}`,
  );

  if (!storedOTP) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "OTP has expired or does not exist",
    );
  }

  if (storedOTP !== otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP",
    );
  }

  return {
    email: user.email,
    verified: true,
  };
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No account found with this email",
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

  const storedOTP = await redisUtils.getValue(
    `password_reset:${user.email}`,
  );

  if (!storedOTP) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "OTP has expired or does not exist",
    );
  }

  if (storedOTP !== otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP",
    );
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    config.bcryptSaltRounds,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await redisUtils.deleteValue(
    `password_reset:${user.email}`,
  );

  return {
    email: user.email,
    passwordReset: true,
  };
};

export const authService = {
  register,
  login,
  refreshToken,
  sendVerificationOTP,
  verifyEmail,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};
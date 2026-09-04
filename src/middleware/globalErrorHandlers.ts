import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import httpStatus from "http-status";
import config from "../config";
import { Prisma } from "../../generated/prisma/client";
import AppError from "../utils/AppError";


const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode ;
  let message = "Something went wrong!";
  let errorDetails: unknown = null;

  // App Error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Zod Error
  else if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";

    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  // Prisma Unique Constraint
  else if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    statusCode = httpStatus.CONFLICT;
    message = "Duplicate value.";

    errorDetails = err.meta;
  }

  // Prisma Record Not Found
  else if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    statusCode = httpStatus.NOT_FOUND;
    message = "Record not found.";
  }

  // Unknown Error
  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
    errorDetails,
    stack: config.nodeEnv === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;
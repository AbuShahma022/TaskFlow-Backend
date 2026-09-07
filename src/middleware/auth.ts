import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { UserRole } from "../../generated/prisma/client";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized",
        );
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(req.user.role)
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource",
        );
      }

      next();
    },
  );
};

export default auth;
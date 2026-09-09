import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { IGetActivityLogsQuery } from "./activityLog.interface";
import { ActivityAction, ActivityEntityType } from "../../../generated/prisma/enums";

const getActivityLogs = async (
  userId: string,
  organizationId: string,
  query: IGetActivityLogsQuery,
) => {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

if (!member) {
  throw new AppError(
    httpStatus.FORBIDDEN,
    "You are not a member of this organization",
  );
}

if (member.role !== "MANAGER") {
  throw new AppError(
    httpStatus.FORBIDDEN,
    "Only organization managers can view activity logs",
  );
}

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    ...(query.action && {
      action: query.action as ActivityAction,
    }),
    ...(query.entityType && {
      entityType: query.entityType as ActivityEntityType,
    }),
    ...(query.userId && {
      userId: query.userId,
    }),
  };

  const [total, logs] = await prisma.$transaction([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const activityLogService = {
  getActivityLogs,
};
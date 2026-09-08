import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
  ICreateSprint,
  IGetSprintsQuery,
} from "./sprint.interface";


const createSprint = async (
  userId: string,
  organizationId: string,
  projectId: string,
  payload: ICreateSprint,
) => {
  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (organizationMember.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can create sprints",
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  if (project.status === "ARCHIVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot create a sprint in an archived project",
    );
  }

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (endDate <= startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint end date must be after start date",
    );
  }

  const sprint = await prisma.sprint.create({
    data: {
      projectId,
      name: payload.name,
      goal: payload.goal,
      startDate,
      endDate,
    },
  });

  return sprint;
};

const getSprints = async (
  userId: string,
  organizationId: string,
  projectId: string,
  query: IGetSprintsQuery,
) => {
  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    projectId,
    deletedAt: null,
    ...(query.status && {
      status: query.status,
    }),
  };

  const [total, sprints] = await prisma.$transaction([
    prisma.sprint.count({ where }),
    prisma.sprint.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        startDate: "desc",
      },
    }),
  ]);

  return {
    data: sprints,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const sprintService = {
  createSprint,
  getSprints,
};
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
  ICreateSprint,
  IGetSprintsQuery,
  IUpdateSprint,
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

const getSprint = async (
  userId: string,
  organizationId: string,
  projectId: string,
  sprintId: string,
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

  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  return sprint;
};

const updateSprint = async (
  userId: string,
  organizationId: string,
  projectId: string,
  sprintId: string,
  payload: IUpdateSprint,
) => {
  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember || organizationMember!.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can update sprints",
    );
  }

  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  if (sprint.status === "COMPLETED" || sprint.status === "ARCHIVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Completed or archived sprints cannot be updated",
    );
  }

  const startDate = payload.startDate
    ? new Date(payload.startDate)
    : sprint.startDate;

  const endDate = payload.endDate
    ? new Date(payload.endDate)
    : sprint.endDate;

  if (endDate <= startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint end date must be after start date",
    );
  }

  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      ...(payload.name !== undefined && {
        name: payload.name,
      }),
      ...(payload.goal !== undefined && {
        goal: payload.goal,
      }),
      ...(payload.startDate !== undefined && {
        startDate,
      }),
      ...(payload.endDate !== undefined && {
        endDate,
      }),
    },
  });

  return updatedSprint;
};

const startSprint = async (
  userId: string,
  organizationId: string,
  projectId: string,
  sprintId: string,
) => {
  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember || organizationMember!.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can start sprints",
    );
  }

  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  if (sprint.status !== "PLANNED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only planned sprints can be started",
    );
  }

  const activeSprint = await prisma.sprint.findFirst({
    where: {
      projectId,
      status: "ACTIVE",
      deletedAt: null,
      id: {
        not: sprintId,
      },
    },
  });

  if (activeSprint) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This project already has an active sprint",
    );
  }

  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  return updatedSprint;
};

const completeSprint = async (
  userId: string,
  organizationId: string,
  projectId: string,
  sprintId: string,
) => {
  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember || organizationMember!.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can complete sprints",
    );
  }

  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  if (sprint.status !== "ACTIVE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only active sprints can be completed",
    );
  }

  const incompleteTask = await prisma.task.findFirst({
    where: {
      sprintId,
      deletedAt: null,
      status: {
        not: "DONE",
      },
    },
    select: {
      id: true,
    },
  });

  if (incompleteTask) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot complete sprint while incomplete tasks exist",
    );
  }

  const completedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      status: "COMPLETED",
    },
  });

  return completedSprint;
};

const archiveSprint = async (
  userId: string,
  organizationId: string,
  projectId: string,
  sprintId: string,
) => {
  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember || organizationMember!.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can archive sprints",
    );
  }

  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  if (sprint.status === "ACTIVE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Active sprint cannot be archived",
    );
  }

  if (sprint.status === "ARCHIVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint is already archived",
    );
  }

  const archivedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      status: "ARCHIVED",
      deletedAt: new Date(),
    },
  });

  return archivedSprint;
};

export const sprintService = {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  startSprint,
  completeSprint,
  archiveSprint,
};
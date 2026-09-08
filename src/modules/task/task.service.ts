import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import  AppError  from "../../utils/AppError";
import { ICreateTask, IGetTasksQuery } from "./task.interface";

const createTask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  payload: ICreateTask,
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

  if (project.status === "ARCHIVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot create tasks in an archived project",
    );
  }

  if (payload.sprintId) {
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: payload.sprintId,
        projectId,
        deletedAt: null,
      },
    });

    if (!sprint) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Sprint does not belong to this project",
      );
    }

    if (sprint.status === "COMPLETED" || sprint.status === "ARCHIVED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot add a task to a completed or archived sprint",
      );
    }
  }

  if (payload.assignedToId) {
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: payload.assignedToId,
      },
    });

    if (!projectMember) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assigned user is not a member of this project",
      );
    }
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      sprintId: payload.sprintId,
      title: payload.title,
      description: payload.description,
      priority: payload.priority ?? "MEDIUM",
      assignedToId: payload.assignedToId,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      createdById: userId,
    },
  });

  return task;
};

const getTasks = async (
  userId: string,
  organizationId: string,
  projectId: string,
  query: IGetTasksQuery,
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
    ...(query.search
      ? {
          OR: [
            {
              title: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.sprintId ? { sprintId: query.sprintId } : {}),
    ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true,
          },
        },
      },
    }),
    prisma.task.count({
      where,
    }),
  ]);

  return {
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const taskService = {
  createTask,
  getTasks
};
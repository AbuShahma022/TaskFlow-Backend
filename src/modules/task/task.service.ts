import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import  AppError  from "../../utils/AppError";
import { IAssignTask, ICreateTask, IGetTasksQuery, IUpdateTask, IUpdateTaskStatus } from "./task.interface";
import { subscriptionService } from "../subscription/subscription.service";

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

  await subscriptionService.checkTaskLimit(organizationId);

const task = await prisma.$transaction(async (tx) => {
  const createdTask = await tx.task.create({
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

  await tx.activityLog.create({
    data: {
      organizationId,
      userId,
      action: "TASK_CREATED",
      entityType: "TASK",
      entityId: createdTask.id,
      description: `Task "${createdTask.title}" was created`,
      metadata: {
        projectId,
        sprintId: createdTask.sprintId,
        assignedToId: createdTask.assignedToId,
        priority: createdTask.priority,
      },
    },
  });

  return createdTask;
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

const getTask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
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

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
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
          startDate: true,
          endDate: true,
        },
      },
      subtasks: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
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
      },
      attachments: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  return task;
};

const updateTask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  payload: IUpdateTask,
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

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (task.status === "DONE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Completed tasks cannot be updated",
    );
  }

  const isManager = organizationMember.role === "MANAGER";
  const isCreator = task.createdById === userId;
  const isAssignee = task.assignedToId === userId;

  if (!isManager && !isCreator && !isAssignee) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update tasks you created or are assigned to",
    );
  }

  if (payload.assignedToId) {
    if (!isManager) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Only managers can assign tasks to other users",
      );
    }

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
        "Cannot assign a task to a completed or archived sprint",
      );
    }
  }

const updatedTask = await prisma.$transaction(async (tx) => {
  const updated = await tx.task.update({
    where: {
      id: taskId,
    },
    data: {
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      sprintId: payload.sprintId,
      assignedToId: payload.assignedToId,
      dueDate:
        payload.dueDate !== undefined
          ? payload.dueDate
            ? new Date(payload.dueDate)
            : null
          : undefined,
    },
  });

  await tx.activityLog.create({
    data: {
      organizationId,
      userId,
      action: "TASK_UPDATED",
      entityType: "TASK",
      entityId: taskId,
      description: `Task "${updated.title}" was updated`,
      metadata: {
        projectId,
        previous: {
          title: task.title,
          priority: task.priority,
          sprintId: task.sprintId,
          assignedToId: task.assignedToId,
          dueDate: task.dueDate,
        },
        updated: {
          title: updated.title,
          priority: updated.priority,
          sprintId: updated.sprintId,
          assignedToId: updated.assignedToId,
          dueDate: updated.dueDate,
        },
      },
    },
  });

  return updated;
});

  return updatedTask;
};

const updateTaskStatus = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  payload: IUpdateTaskStatus,
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

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const isManager = organizationMember.role === "MANAGER";
  const isCreator = task.createdById === userId;
  const isAssignee = task.assignedToId === userId;

  if (!isManager && !isCreator && !isAssignee) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update tasks you created or are assigned to",
    );
  }

  if (task.status === payload.status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Task is already in this status",
    );
  }

  const allowedTransitions: Record<string, string[]> = {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["TODO", "IN_REVIEW"],
    IN_REVIEW: ["IN_PROGRESS", "DONE"],
    DONE: [],
  };

  const allowedNextStatuses = allowedTransitions[task.status] ?? [];

  if (!allowedNextStatuses.includes(payload.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change task status from ${task.status} to ${payload.status}`,
    );
  }
const updatedTask = await prisma.$transaction(async (tx) => {
  const updated = await tx.task.update({
    where: {
      id: taskId,
    },
    data: {
      status: payload.status,
    },
  });

  await tx.activityLog.create({
    data: {
      organizationId,
      userId,
      action:
        payload.status === "DONE"
          ? "TASK_COMPLETED"
          : "TASK_STATUS_CHANGED",
      entityType: "TASK",
      entityId: taskId,
      description:
        payload.status === "DONE"
          ? `Task "${updated.title}" was completed`
          : `Task "${updated.title}" status changed from ${task.status} to ${updated.status}`,
      metadata: {
        projectId,
        previousStatus: task.status,
        newStatus: updated.status,
      },
    },
  });

  return updated;
});

  return updatedTask;
};

const assignTask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  payload: IAssignTask,
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
      "Only managers can assign tasks",
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (task.status === "DONE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Completed tasks cannot be assigned",
    );
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

  const updatedTask = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: {
        id: taskId,
      },
      data: {
        assignedToId: payload.assignedToId,
      },
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        action: "TASK_ASSIGNED",
        entityType: "TASK",
        entityId: taskId,
        description: payload.assignedToId
          ? "Task assigned to a project member"
          : "Task assignment removed",
        metadata: {
          assignedToId: payload.assignedToId,
          previousAssignedToId: task.assignedToId,
        },
      },
    });

    return updated;
  });

  return updatedTask;
};

const deleteTask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
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
      "Only managers can delete tasks",
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const deletedTask = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: {
        id: taskId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        action: "TASK_UPDATED",
        entityType: "TASK",
        entityId: taskId,
        description: "Task deleted",
        metadata: {
          deletedAt: updated.deletedAt,
        },
      },
    });

    return updated;
  });

  return deletedTask;
};

export const taskService = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask
};
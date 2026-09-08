import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateSubtask, IUpdateSubtask, IUpdateSubtaskStatus } from "./subtask.interface";

const createSubtask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  payload: ICreateSubtask,
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
      "Cannot create a subtask for a completed task",
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

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title: payload.title,
      description: payload.description,
      assignedToId: payload.assignedToId,
    },
  });

  return subtask;
};

const getSubtasks = async (
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
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const subtasks = await prisma.subtask.findMany({
    where: {
      taskId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
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
    },
  });

  return subtasks;
};

const updateSubtask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  subtaskId: string,
  payload: IUpdateSubtask,
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

  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      taskId,
      deletedAt: null,
      task: {
        id: taskId,
        projectId,
        deletedAt: null,
        project: {
          organizationId,
          deletedAt: null,
        },
      },
    },
    include: {
      task: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!subtask) {
    throw new AppError(httpStatus.NOT_FOUND, "Subtask not found");
  }

  if (subtask.task.status === "DONE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot update subtask of a completed task",
    );
  }
/*

   MEMBER can only update a subtask assigned to themselves.
  MANAGER can update any subtask.

*/
  if (member.role === "MEMBER" && subtask.assignedToId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update subtasks assigned to you",
    );
  }

  // If assigning/reassigning, verify the user belongs to this project.
  if (payload.assignedToId) {
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: payload.assignedToId,
        },
      },
    });

    if (!projectMember) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assigned user must be a member of this project",
      );
    }
  }

  const updatedSubtask = await prisma.subtask.update({
    where: {
      id: subtaskId,
    },
    data: {
      ...(payload.title !== undefined && {
        title: payload.title,
      }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.assignedToId !== undefined && {
        assignedToId: payload.assignedToId,
      }),
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
    },
  });

  return updatedSubtask;
};

const updateSubtaskStatus = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  subtaskId: string,
  payload: IUpdateSubtaskStatus,
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

  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      taskId,
      deletedAt: null,
      task: {
        id: taskId,
        projectId,
        deletedAt: null,
        project: {
          organizationId,
          deletedAt: null,
        },
      },
    },
    include: {
      task: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!subtask) {
    throw new AppError(httpStatus.NOT_FOUND, "Subtask not found");
  }

  if (subtask.task.status === "DONE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot update subtask of a completed task",
    );
  }

  if (member.role === "MEMBER" && subtask.assignedToId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update subtasks assigned to you",
    );
  }

  if (subtask.status === "DONE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot change status of a completed subtask",
    );
  }

  const allowedTransitions: Record<string, string[]> = {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["TODO", "DONE"],
    DONE: [],
  };

  if (!allowedTransitions[subtask.status]?.includes(payload.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from ${subtask.status} to ${payload.status}`,
    );
  }

  const updatedSubtask = await prisma.subtask.update({
    where: {
      id: subtaskId,
    },
    data: {
      status: payload.status,
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
    },
  });

  return updatedSubtask;
};

const deleteSubtask = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  subtaskId: string,
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
      "Only organization managers can delete subtasks",
    );
  }

  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      taskId,
      deletedAt: null,
      task: {
        id: taskId,
        projectId,
        deletedAt: null,
        project: {
          organizationId,
          deletedAt: null,
        },
      },
    },
    include: {
      task: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!subtask) {
    throw new AppError(httpStatus.NOT_FOUND, "Subtask not found");
  }

  if (subtask.task.status === "DONE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete subtask of a completed task",
    );
  }

  const deletedSubtask = await prisma.subtask.update({
    where: {
      id: subtaskId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return deletedSubtask;
};

export const subtaskService = {
  createSubtask,
  getSubtasks,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask
};